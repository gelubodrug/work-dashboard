"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"

// NumberFlow's actual spring easing curve
const SPRING_EASING =
  "linear(0, 0.0018 0.48%, 0.0077, 0.0175 1.53%, 0.0319 2.1%, 0.0715 3.24%, 0.1293 4.51%, 0.1856 5.57%, 0.258 6.79%, 0.549 11.35%, 0.6709 13.37%, 0.7872 15.51%, 0.8804 17.53%, 0.9224 18.58%, 0.9583, 0.99 20.6%, 1.0186, 1.0429, 1.0631 23.75%, 1.08 24.85%, 1.0935 25.99%, 1.1054 27.48%, 1.1117 29.01%, 1.1129 30.68%, 1.1089 32.52%, 1.1024 34.01%, 1.0926 35.72%, 1.04 43.17%, 1.0171 47.02%, 1.0072, 0.9995 51.32%, 0.9937 53.55%, 0.9898 55.88%, 0.9876 58.68%, 0.9874 61.79%, 1 81.47%, 1.0014 88.96%, 1.0008 99.96%)"

interface NumberFlowProps {
  value: number
  suffix?: string
  prefix?: string
  className?: string
  transformTiming?: { duration: number; easing: string }
  spinTiming?: { duration: number; easing: string }
  opacityTiming?: { duration: number; easing: string }
}

export function NumberFlow({
  value,
  suffix = "",
  prefix = "",
  className = "",
  transformTiming = {
    duration: 750,
    easing: SPRING_EASING,
  },
  spinTiming = {
    duration: 2136, // NumberFlow's actual spring duration
    easing: SPRING_EASING,
  },
  opacityTiming = {
    duration: 350,
    easing: "ease-out",
  },
}: NumberFlowProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const previousValue = useRef(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const [digits, setDigits] = useState<string[]>([])

  // Convert number to digits
  useEffect(() => {
    const valueStr = String(Math.abs(value))
    setDigits(valueStr.split(""))
  }, [value])

  useEffect(() => {
    if (previousValue.current !== value) {
      setIsAnimating(true)

      // Create a counting animation
      const startValue = previousValue.current
      const endValue = value
      const duration = spinTiming.duration

      let startTime: number | null = null
      const animateValue = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Custom easing function to approximate NumberFlow's spring
        const easeOutCubic = 1 - Math.pow(1 - progress, 3)
        const currentValue = startValue + (endValue - startValue) * easeOutCubic

        setDisplayValue(Math.round(currentValue))

        if (progress < 1) {
          requestAnimationFrame(animateValue)
        } else {
          setDisplayValue(endValue)
          setIsAnimating(false)
          previousValue.current = value
        }
      }

      requestAnimationFrame(animateValue)
    }
  }, [value, spinTiming.duration])

  return (
    <motion.span
      className={`${className} inline-block`}
      layout
      layoutRoot
      style={{
        fontVariantNumeric: "tabular-nums",
        fontFeatureSettings: '"tnum"',
        "--number-flow-char-height": "1em",
        "--number-flow-mask-height": "0.25em",
        "--spring-easing": SPRING_EASING,
        "--spring-duration": `${spinTiming.duration}ms`,
      }}
    >
      <motion.span
        className="inline-block"
        animate={{
          filter: isAnimating ? "blur(0.5px)" : "blur(0px)",
          scale: isAnimating ? [1, 1.01, 1] : 1,
        }}
        transition={{
          filter: {
            duration: opacityTiming.duration / 1000,
            ease: "easeInOut",
          },
          scale: {
            duration: transformTiming.duration / 1000,
            ease: "easeOut",
          },
        }}
      >
        {prefix}
        {displayValue}
        {suffix}
      </motion.span>
    </motion.span>
  )
}

export function NumberFlowGroup({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      layout
      transition={{
        layout: {
          duration: 0.75,
          ease: "easeOut",
        },
      }}
    >
      {children}
    </motion.div>
  )
}
