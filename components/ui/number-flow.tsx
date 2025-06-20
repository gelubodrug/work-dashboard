"use client"

import React, { useEffect, useRef, useState } from "react"
import NumberFlowLite from "./number-flow-lite"
import type { Plugin } from "./plugins"

export interface NumberFlowProps {
  value: number
  format?: Intl.NumberFormatOptions
  locales?: string | string[]
  plugins?: Plugin[]
  trend?: boolean | "increasing" | "decreasing"
  animated?: boolean
  respectMotionPreference?: boolean
  willChange?: boolean
  isolate?: boolean
  opacityTiming?: {
    duration: number
    easing: string
  }
  transformTiming?: {
    duration: number
    easing: string
  }
  spinTiming?: {
    duration: number
    easing: string
  }
  className?: string
  style?: React.CSSProperties
  prefix?: string
  suffix?: string
  onAnimationsStart?: () => void
  onAnimationsFinish?: () => void
}

const NumberFlow: React.FC<NumberFlowProps> = ({
  value,
  format,
  locales,
  plugins,
  trend,
  animated = true,
  respectMotionPreference = true,
  willChange = true,
  isolate = false,
  opacityTiming,
  transformTiming,
  spinTiming,
  className,
  style,
  prefix,
  suffix,
  onAnimationsStart,
  onAnimationsFinish,
}) => {
  const ref = useRef<HTMLElement>(null)
  const [numberFlow, setNumberFlow] = useState<NumberFlowLite | null>(null)

  useEffect(() => {
    if (!ref.current) return

    const instance = new NumberFlowLite(ref.current, {
      value,
      format,
      locales,
      plugins,
      trend,
      animated,
      respectMotionPreference,
      willChange,
      isolate,
      opacityTiming,
      transformTiming,
      spinTiming,
      prefix,
      suffix,
      onAnimationsStart,
      onAnimationsFinish,
    })

    setNumberFlow(instance)

    return () => {
      instance.destroy()
    }
  }, [])

  useEffect(() => {
    if (numberFlow) {
      numberFlow.update({
        value,
        format,
        locales,
        plugins,
        trend,
        animated,
        respectMotionPreference,
        willChange,
        isolate,
        opacityTiming,
        transformTiming,
        spinTiming,
        prefix,
        suffix,
        onAnimationsStart,
        onAnimationsFinish,
      })
    }
  }, [
    numberFlow,
    value,
    format,
    locales,
    plugins,
    trend,
    animated,
    respectMotionPreference,
    willChange,
    isolate,
    opacityTiming,
    transformTiming,
    spinTiming,
    prefix,
    suffix,
    onAnimationsStart,
    onAnimationsFinish,
  ])

  return <span ref={ref} className={className} style={style} />
}

export default NumberFlow

// Group context for synchronized animations
const GroupContext = React.createContext<{
  register: (instance: NumberFlowLite) => void
  unregister: (instance: NumberFlowLite) => void
} | null>(null)

export const NumberFlowGroup: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const instancesRef = useRef<Set<NumberFlowLite>>(new Set())

  const register = (instance: NumberFlowLite) => {
    instancesRef.current.add(instance)
  }

  const unregister = (instance: NumberFlowLite) => {
    instancesRef.current.delete(instance)
  }

  return <GroupContext.Provider value={{ register, unregister }}>{children}</GroupContext.Provider>
}
