import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.14em]",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/15 text-primary",
        secondary: "border-secondary/30 bg-secondary/15 text-secondary",
        destructive: "border-destructive/30 bg-destructive/15 text-destructive",
        success: "border-success/30 bg-success/15 text-success",
        outline: "border-white/[0.12] bg-card/60 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
