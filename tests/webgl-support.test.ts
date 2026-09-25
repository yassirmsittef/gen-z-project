import { afterEach, describe, expect, it, vi } from "vitest";
import { hasWebGL, resetWebGLProbe } from "@/lib/webgl-support";

type FakeCanvas = { getContext: (kind: string) => unknown };

function installDocument(canvas: FakeCanvas) {
  (globalThis as { document?: unknown }).document = {
    createElement: () => canvas,
  };
}

afterEach(() => {
  delete (globalThis as { document?: unknown }).document;
  resetWebGLProbe();
});

describe("hasWebGL — la sonde qui évite la page « 500 » aux navigateurs sans 3D", () => {
  it("répond non hors navigateur (rendu serveur)", () => {
    expect(hasWebGL()).toBe(false);
  });

  it("répond non quand le navigateur refuse le contexte (mode Isolement d'iOS)", () => {
    installDocument({ getContext: () => null });
    expect(hasWebGL()).toBe(false);
  });

  it("répond non quand la création du contexte lève une erreur", () => {
    installDocument({
      getContext: () => {
        throw new Error("WebGL désactivé");
      },
    });
    expect(hasWebGL()).toBe(false);
  });

  it("répond oui pour WebGL 2, et rend aussitôt le contexte de sonde", () => {
    const loseContext = vi.fn();
    const getContext = vi.fn((kind: string) =>
      kind === "webgl2" ? { getExtension: () => ({ loseContext }) } : null
    );
    installDocument({ getContext });
    expect(hasWebGL()).toBe(true);
    expect(getContext).toHaveBeenCalledWith("webgl2");
    expect(loseContext).toHaveBeenCalledTimes(1);
  });

  it("ne sonde qu'une fois par page", () => {
    const getContext = vi.fn(() => null);
    installDocument({ getContext });
    expect(hasWebGL()).toBe(false);
    expect(hasWebGL()).toBe(false);
    expect(getContext).toHaveBeenCalledTimes(1);
  });
});
