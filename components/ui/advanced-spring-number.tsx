"use client"

import { useEffect, useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface AdvancedSpringNumberProps {
  value: number
  suffix?: string
  prefix?: string
  className?: string
  format?: Intl.NumberFormatOptions
  willChange?: boolean
}

// Your exact spring easing curve as CSS
const springEasing =
  "linear(0, 0.0017, 0.0067 1.14%, 0.0158, 0.0282 2.41%, 0.0639 3.74%, 0.1175 5.26%, 0.17 6.53%, 0.2335 7.92%, 0.5013 13.38%, 0.6194 15.91%, 0.728 18.51%, 0.8169, 0.8908 23.46%, 0.9228, 0.9511, 0.9756 27.26%, 0.9977 28.59%, 1.0169, 1.0325 31.38%, 1.0494 33.41%, 1.0605 35.5%, 0.0667 37.78%, 1.0679 40.32%, 1.0652 42.6%, 1.0591 45.26%, 1.0277 54.96%, 1.0156 59.27%, 1.0071 63.27%, 1.0011 67.39%, 0.997 72.4%, 0.9954 78.16%, 0.9991 99.97%)"

export function AdvancedSpringNumber({
  value,
  suffix = "",
  prefix = "",
  className = "",
  format,
  willChange = false,
}: AdvancedSpringNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const previousValue = useRef(value)

  useEffect(() => {
    if (previousValue.current !== value) {
      setIsAnimating(true)

      const startValue = previousValue.current
      const endValue = value
      const startTime = performance.now()
      const duration = 1776 // Your exact 1.776s

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Use a spring-like easing function
        const easeSpring = (t: number) => {
          const c1 = 1.70158
          const c2 = c1 * 1.525
          const c3 = c1 + 1

          if (t < 0.5) {
            return (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2
          }

          return (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2
        }

        const easedProgress = easeSpring(progress)
        const currentValue = startValue + (endValue - startValue) * easedProgress

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
  }, [value])

  const formatValue = (val: number) => {
    if (format) {
      return new Intl.NumberFormat("en-US", format).format(val)
    }
    // Smart formatting based on suffix
    if (suffix.includes("h") || suffix.includes("km")) {
      return val.toFixed(1)
    }
    return Math.round(val).toString()
  }

  // Split the formatted value into individual characters for digit animation
  const formattedValue = formatValue(displayValue)
  const digits = formattedValue.split("")

  return (
    <span
      className={`${className} inline-block`}
      style={{
        fontVariantNumeric: "tabular-nums",
        fontFeatureSettings: '"tnum"',
        willChange: willChange ? "transform" : "auto",
      }}
    >
      {prefix}
      <span className="relative inline-block">
        <AnimatePresence mode="popLayout">
          {digits.map((digit, index) => (
            <motion.span
              key={`${digit}-${index}-${value}`}
              className="inline-block"
              initial={{
                y: isAnimating ? (Math.random() > 0.5 ? -20 : 20) : 0,
                opacity: isAnimating ? 0 : 1,
                scale: isAnimating ? 0.8 : 1,
                filter: isAnimating ? "blur(2px)" : "blur(0px)",
              }}
              animate={{
                y: 0,
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                y: Math.random() > 0.5 ? -20 : 20,
                opacity: 0,
                scale: 0.8,
                filter: "blur(2px)",
              }}
              transition={{
                duration: 1.776,
                ease: [0.25, 0.1, 0.25, 1],
                delay: index * 0.05, // Stagger each digit slightly
              }}
              style={{
                display: "inline-block",
                minWidth: digit === "." ? "0.3em" : "0.6em",
                textAlign: "center",
              }}
            >
              {digit}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
      {suffix}
    </span>
  )
}
