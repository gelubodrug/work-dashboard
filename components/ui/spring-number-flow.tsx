"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

interface SpringNumberFlowProps {
  value: number
  suffix?: string
  prefix?: string
  className?: string
  format?: Intl.NumberFormatOptions
  willChange?: boolean
}

export function SpringNumberFlow({
  value,
  suffix = "",
  prefix = "",
  className = "",
  format,
  willChange = false,
}: SpringNumberFlowProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)
  const animationRef = useRef<number>()

  useEffect(() => {
    if (previousValue.current !== value) {
      const startValue = previousValue.current
      const endValue = value
      const startTime = performance.now()
      const duration = 1776 // 1.776s spring duration

      // Cancel any existing animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Spring-like easing function
        const easeSpring = (t: number) => {
          // Approximation of your spring curve
          return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        }

        const easedProgress = easeSpring(progress)
        const currentValue = startValue + (endValue - startValue) * easedProgress

        setDisplayValue(currentValue)

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate)
        } else {
          // Ensure we end exactly at the target value
          setDisplayValue(endValue)
          previousValue.current = value
        }
      }

      animationRef.current = requestAnimationFrame(animate)
    } else {
      // If value hasn't changed, make sure we're displaying the exact value
      setDisplayValue(value)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [value])

  const formatValue = (val: number) => {
    if (format) {
      return new Intl.NumberFormat("en-US", format).format(val)
    }
    // Default formatting based on suffix
    if (suffix.includes("h") || suffix.includes("km")) {
      return val.toFixed(1)
    }
    return Math.round(val).toString()
  }

  return (
    <motion.span
      className={`${className} inline-block tabular-nums`}
      style={{
        willChange: willChange ? "transform" : "auto",
      }}
      initial={false}
      animate={{
        scale: previousValue.current !== value ? [1, 1.02, 1] : 1,
      }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
      }}
    >
      {prefix}
      {formatValue(displayValue)}
      {suffix}
    </motion.span>
  )
}
