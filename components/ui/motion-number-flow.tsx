"use client"

import type React from "react"

import { motion, MotionConfig } from "motion/react"
import NumberFlow, { useCanAnimate } from "@number-flow/react"
import { continuous } from "@number-flow/react"

// Create motion-enabled NumberFlow
const MotionNumberFlow = motion.create(NumberFlow)

interface MotionNumberFlowProps {
  value: number
  suffix?: string
  prefix?: string
  className?: string
  format?: Intl.NumberFormatOptions
}

export function AnimatedNumberFlow({ value, suffix, prefix, className, format }: MotionNumberFlowProps) {
  const canAnimate = useCanAnimate()

  return (
    <MotionConfig
      transition={{
        layout: canAnimate ? { duration: 0.9, bounce: 0, type: "spring" } : { duration: 0 },
      }}
    >
      <MotionNumberFlow
        value={value}
        suffix={suffix}
        prefix={prefix}
        className={className}
        format={format}
        plugins={[continuous]}
        layout
        layoutRoot
        style={{
          "--number-flow-char-height": "0.85em",
          "--number-flow-mask-height": "0.3em",
        }}
      />
    </MotionConfig>
  )
}

// Group component for synchronized animations
export function AnimatedNumberGroup({ children }: { children: React.ReactNode }) {
  const canAnimate = useCanAnimate()

  return (
    <MotionConfig
      transition={{
        layout: canAnimate ? { duration: 0.9, bounce: 0, type: "spring" } : { duration: 0 },
      }}
    >
      {children}
    </MotionConfig>
  )
}

export { useCanAnimate }
