import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center rounded-xl border border-transparent text-sm font-bold whitespace-nowrap transition-all duration-300 ease-out outline-none select-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary via-indigo-600 to-primary bg-[length:200%_auto] text-primary-foreground shadow-sm shadow-primary/25 hover:shadow-md hover:shadow-primary/35 hover:-translate-y-0.5 border border-primary/20",
        outline:
          "border-border/80 bg-background/80 hover:bg-muted/80 text-foreground hover:border-primary/40 hover:text-primary backdrop-blur-md shadow-2xs hover:shadow-xs hover:-translate-y-0.5",
        secondary:
          "bg-secondary/90 text-secondary-foreground hover:bg-secondary hover:-translate-y-0.5 shadow-2xs hover:shadow-xs border border-border/40",
        ghost:
          "hover:bg-muted/70 text-foreground hover:text-primary active:scale-[0.98] border-transparent",
        destructive:
          "bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-sm shadow-red-500/25 hover:shadow-md hover:shadow-red-500/35 hover:-translate-y-0.5 border border-red-400/20",
        link:
          "text-primary underline-offset-4 hover:underline hover:text-primary/80 active:scale-100",
      },
      size: {
        default:  "h-9 gap-2 rounded-xl px-4 text-xs sm:text-sm",
        xs:       "h-6 gap-1 rounded-lg px-2 text-[11px]",
        sm:       "h-8 gap-1.5 rounded-xl px-3 text-xs",
        lg:       "h-11 gap-2.5 rounded-2xl px-6 text-sm font-bold",
        icon:     "size-9 rounded-xl",
        "icon-xs":"size-6 rounded-lg",
        "icon-sm":"size-8 rounded-xl",
        "icon-lg":"size-11 rounded-2xl",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Renders children directly instead of a <button> — pass a <Link> as child */
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    // When asChild, clone the single child and spread button styles onto it
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(
        children as React.ReactElement<React.HTMLAttributes<HTMLElement>>,
        {
          className: cn(
            buttonVariants({ variant, size }),
            className,
            (children as React.ReactElement<{ className?: string }>).props.className
          ),
        }
      )
    }

    return (
      <button
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
