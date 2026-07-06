import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const lift = "hover:-translate-y-0.5 transition-all duration-200 ease-out";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Dégradé accent : réservé à l'action principale de l'écran
        default: cn(
          "bg-accent-gradient text-primary-foreground shadow-glow hover:shadow-glow-strong",
          lift
        ),
        secondary: cn(
          "bg-secondary/15 text-secondary border border-secondary/30 hover:bg-secondary/25",
          lift
        ),
        outline: cn(
          "border border-white/[0.12] bg-card/60 text-foreground backdrop-blur-md hover:bg-accent",
          lift
        ),
        destructive: cn(
          "bg-destructive/15 text-destructive border border-destructive/30 hover:bg-destructive/25",
          lift
        ),
        success: cn(
          "bg-success/15 text-success border border-success/30 hover:bg-success/25",
          lift
        ),
        ghost: "transition-colors duration-200 hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-10 rounded-xl px-3",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
