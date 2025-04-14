"use client"

/**
 * Tooltip Component
 * 
 * A set of components for creating tooltips that display informative text
 * when users hover over, focus on, or tap an element.
 */

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"

import { cn } from "@/lib/utils"

/**
 * TooltipProvider Component
 * 
 * Wraps the tooltip components and provides context.
 */
const TooltipProvider = TooltipPrimitive.Provider

/**
 * Tooltip Component
 * 
 * The root component that wraps the trigger and content.
 */
const Tooltip = TooltipPrimitive.Root

/**
 * TooltipTrigger Component
 * 
 * The element that triggers the tooltip when interacted with.
 */
const TooltipTrigger = TooltipPrimitive.Trigger

/**
 * TooltipContent Component
 * 
 * The component that displays the tooltip content.
 * 
 * @param className - Additional CSS classes to apply
 * @param sideOffset - Distance between tooltip and trigger element
 */
const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }

