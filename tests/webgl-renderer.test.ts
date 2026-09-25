import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Le second filet : même quand la sonde dit oui, le constructeur three.js peut
 * lever (plafond de contextes, GPU en reset). Sabotage du constructeur pour
 * vérifier que la scène reçoit `null` et jamais une exception.
 */
const mocks = vi.hoisted(() => ({
  constructed: vi.fn<(parameters: unknown) => void>(),
  hasWebGL: vi.fn<() => boolean>(() => true),
}));

vi.mock("three", () => ({
  WebGLRenderer: class {
    constructor(parameters: unknown) {
      mocks.constructed(parameters);
    }
  },
}));

vi.mock("@/lib/webgl-support", () => ({ hasWebGL: mocks.hasWebGL }));

import { createWebGLRenderer } from "@/lib/webgl-renderer";

beforeEach(() => {
  mocks.constructed.mockReset();
  mocks.hasWebGL.mockReset();
  mocks.hasWebGL.mockReturnValue(true);
});

describe("createWebGLRenderer — un rendu ou null, jamais une exception", () => {
  it("construit le rendu avec les paramètres demandés quand WebGL est là", () => {
    const renderer = createWebGLRenderer({ antialias: true, alpha: true });
    expect(renderer).not.toBeNull();
    expect(mocks.constructed).toHaveBeenCalledWith({ antialias: true, alpha: true });
  });

  it("renvoie null sans même appeler three.js quand la sonde dit non", () => {
    mocks.hasWebGL.mockReturnValue(false);
    expect(createWebGLRenderer({})).toBeNull();
    expect(mocks.constructed).not.toHaveBeenCalled();
  });

  it("renvoie null quand le constructeur lève « Error creating WebGL context »", () => {
    mocks.constructed.mockImplementation(() => {
      throw new Error("THREE.WebGLRenderer: Error creating WebGL context.");
    });
    expect(createWebGLRenderer({})).toBeNull();
    expect(mocks.constructed).toHaveBeenCalledTimes(1);
  });
});
