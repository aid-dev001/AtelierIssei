import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onChange, onKeyDown, ...props }, ref) => {
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (onChange) {
        onChange(e);
      }
    }, [onChange]);

    const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();
      if (onKeyDown) {
        onKeyDown(e);
      }
    }, [onKeyDown]);

    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      e.stopPropagation();
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
