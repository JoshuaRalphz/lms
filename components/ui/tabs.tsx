"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    defaultActiveKey?: string
  }
>(({ className, defaultActiveKey, ...props }, ref) => {
  const [activeKey, setActiveKey] = React.useState(defaultActiveKey || "")

  return (
    <div
      ref={ref}
      className={cn("flex flex-col", className)}
      {...props}
      data-active-key={activeKey}
    >
      {React.Children.map(props.children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            activeKey,
            setActiveKey,
          } as any)
        }
        return child
      })}
    </div>
  )
})
Tabs.displayName = "Tabs"

const TabsList = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-start border-b border-gray-200",
      className
    )}
    {...props}
  />
))
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string
  activeKey?: string
  setActiveKey?: (key: string) => void
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, activeKey, setActiveKey, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-colors hover:text-[#7886C7]",
        activeKey === value
          ? "border-b-2 border-[#7886C7] text-[#7886C7]"
          : "text-gray-500",
        className
      )}
      onClick={() => setActiveKey?.(value)}
      {...props}
    />
  )
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  activeKey?: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, activeKey, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "mt-4",
        activeKey === value ? "block" : "hidden",
        className
      )}
      {...props}
    />
  )
)
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent } 