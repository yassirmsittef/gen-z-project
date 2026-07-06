"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

/** Traînée lumineuse : dégradé accent + glow, extrémité arrondie. */
const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2.5 w-full overflow-hidden rounded-full bg-white/5", className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="relative h-full w-full flex-1 overflow-hidden rounded-full bg-accent-gradient shadow-glow transition-transform duration-300"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    >
      {/* Signature : l'éclat de financement qui balaie la barre. */}
      <span className="progress-trace" aria-hidden />
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
