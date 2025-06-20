"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

interface SimpleNumberFlowProps {
  value: number
  suffix?: string
  prefix?: string
  className?: string
  format?: Intl.NumberFormatOptions
  duration?: number
}

export function SimpleNumberFlow({
  value,
  suffix = "",
  prefix = "",
  className = "",
  format,
  duration = 1200,
}: SimpleNumberFlowProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const previousValue = useRef(value)

  useEffect(() => {
    if (previousValue.current !== value) {
      setIsAnimating(true)

      const startValue = previousValue.current
      const endValue = value
      const startTime = performance.now()

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Smooth easing function
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        const currentValue = startValue + (endValue - startValue) * easeOutCubic

        setDisplayValue(currentValue)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          setDisplayValue(endValue)
          setIsAnimating(false)
          previousValue.current = value
        }
      }

      requestAnimationFrame(animate)
    }
  }, [value, duration])

  const formatValue = (val: number) => {
    if (format) {
      return new Intl.NumberFormat("en-US", format).format(val)
    }
    return Math.round(val * 10) / 10 // Round to 1 decimal place
  }

  return (
    <motion.span
      className={`${className} inline-block`}
      style={{
        fontVariantNumeric: "tabular-nums",
        fontFeatureSettings: '"tnum"',
      }}
      animate={{
        scale: isAnimating ? [1, 1.02, 1] : 1,
      }}
      transition={{
        scale: {
          duration: 0.3,
          ease: "easeOut",
        },
      }}
    >
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </motion.span>
  )
}
