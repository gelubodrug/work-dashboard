"use client"

import type React from "react"
import { useEffect, useState, useRef } from "react"
import { motion, animate, useMotionValue, useTransform } from "framer-motion"

interface EffectTiming {
  duration: number
  easing: string
}

interface AnimatedNumberProps {
  value: number
  suffix?: string
  prefix?: string
  className?: string
  // NumberFlow's three distinct timing props
  transformTiming?: EffectTiming
  spinTiming?: EffectTiming
  opacityTiming?: EffectTiming
}

// NumberFlow's actual spring easing curve
const SPRING_EASING =
  "linear(0, 0.0018 0.48%, 0.0077, 0.0175 1.53%, 0.0319 2.1%, 0.0715 3.24%, 0.1293 4.51%, 0.1856 5.57%, 0.258 6.79%, 0.549 11.35%, 0.6709 13.37%, 0.7872 15.51%, 0.8804 17.53%, 0.9224 18.58%, 0.9583, 0.99 20.6%, 1.0186, 1.0429, 1.0631 23.75%, 1.08 24.85%, 1.0935 25.99%, 1.1054 27.48%, 1.1117 29.01%, 1.1129 30.68%, 1.1089 32.52%, 1.1024 34.01%, 1.0926 35.72%, 1.04 43.17%, 1.0171 47.02%, 1.0072, 0.9995 51.32%, 0.9937 53.55%, 0.9898 55.88%, 0.9876 58.68%, 0.9874 61.79%, 1 81.47%, 1.0014 88.96%, 1.0008 99.96%)"

export function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
  className = "",
  // NumberFlow's default timing settings
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
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isCharacterChanging, setIsCharacterChanging] = useState(false)
  const previousValue = useRef(value)
  const motionValue = useMotionValue(value)

  // Transform the motion value to rounded integers for display
  const rounded = useTransform(motionValue, (latest) => Math.round(latest))

  useEffect(() => {
    const unsubscribe = rounded.on("change", (latest) => {
      setDisplayValue(latest)
    })

    return unsubscribe
  }, [rounded])

  useEffect(() => {
    if (previousValue.current !== value) {
      setIsAnimating(true)
      setIsCharacterChanging(true)

      // 1. SPIN TIMING - Used for the digit spin animations
      animate(motionValue, value, {
        duration: spinTiming.duration / 1000, // Convert to seconds
        ease: "easeOut", // Fallback since CSS linear() isn't supported in Motion
        onComplete: () => {
          setIsAnimating(false)
        },
      })

      // 2. OPACITY TIMING - Used for fading in/out characters
      setTimeout(() => {
        setIsCharacterChanging(false)
      }, opacityTiming.duration)

      previousValue.current = value
    }
  }, [value, motionValue, spinTiming.duration, opacityTiming.duration])

  return (
    <motion.span
      className={`${className} inline-block`}
      layout
      layoutRoot
      style={
        {
          fontVariantNumeric: "tabular-nums",
          fontFeatureSettings: '"tnum"',
          // NumberFlow CSS custom properties
          "--spring-easing": SPRING_EASING,
          "--spring-duration": `${spinTiming.duration}ms`,
        } as React.CSSProperties
      }
      // 3. TRANSFORM TIMING - Used for layout-related transforms
      transition={{
        layout: {
          duration: transformTiming.duration / 1000,
          ease: "easeOut", // Fallback for layout animations
        },
      }}
    >
      {/* Transform animations - layout, scale, position */}
      <motion.span
        className="inline-block"
        animate={{
          scale: isAnimating ? [1, 1.01, 1] : 1,
          y: isAnimating ? [0, -1, 0] : 0,
        }}
        transition={{
          scale: {
            duration: transformTiming.duration / 1000,
            ease: "easeOut",
          },
          y: {
            duration: transformTiming.duration / 1000,
            ease: "easeOut",
          },
        }}
      >
        {/* Opacity animations - fading characters in/out */}
        <motion.span
          className="inline-block"
          animate={{
            opacity: isCharacterChanging ? [1, 0.7, 1] : 1,
            filter: isCharacterChanging ? ["blur(0px)", "blur(0.5px)", "blur(0px)"] : "blur(0px)",
          }}
          transition={{
            opacity: {
              duration: opacityTiming.duration / 1000,
              ease: opacityTiming.easing === "ease-out" ? "easeOut" : "linear",
            },
            filter: {
              duration: opacityTiming.duration / 1000,
              ease: opacityTiming.easing === "ease-out" ? "easeOut" : "linear",
            },
          }}
        >
          {prefix}
          {/* Spin animations - the actual digit rolling */}
          <motion.span
            className="inline-block"
            key={displayValue} // Force re-render for spin effect
            initial={{ y: -5, opacity: 0.8 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: spinTiming.duration / 1000,
              ease: "easeOut", // Approximation of spring easing
            }}
          >
            {displayValue}
          </motion.span>
          {suffix}
        </motion.span>
      </motion.span>
    </motion.span>
  )
}

// CSS-based version that uses the actual NumberFlow timing
export function AnimatedNumberCSS({
  value,
  suffix = "",
  prefix = "",
  className = "",
}: {
  value: number
  suffix?: string
  prefix?: string
  className?: string
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isAnimating, setIsAnimating] = useState(false)
  const previousValue = useRef(value)

  useEffect(() => {
    if (previousValue.current !== value) {
      setIsAnimating(true)

      // Use the actual NumberFlow spring duration
      const duration = 2136 // 2.136s in milliseconds

      let startTime: number
      const animateValue = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)

        // Approximate the spring easing with a custom function
        const springEase = (t: number) => {
          // Simplified spring easing approximation
          return 1 - Math.pow(1 - t, 3) * Math.cos(t * Math.PI * 2) * Math.exp(-t * 3)
        }

        const easedProgress = springEase(progress)
        const startValue = previousValue.current
        const endValue = value
        const currentValue = startValue + (endValue - startValue) * easedProgress

        setDisplayValue(Math.round(currentValue))

        if (progress < 1) {
          requestAnimationFrame(animateValue)
        } else {
          setDisplayValue(endValue)
          setIsAnimating(false)
        }
      }

      requestAnimationFrame(animateValue)
      previousValue.current = value
    }
  }, [value])

  return (
    <span
      className={`${className} inline-block transition-all`}
      style={
        {
          fontVariantNumeric: "tabular-nums",
          fontFeatureSettings: '"tnum"',
          // NumberFlow's actual CSS custom properties
          "--spring-easing": SPRING_EASING,
          "--spring-duration": "2.136s",
          transform: isAnimating ? "scale(1.01)" : "scale(1)",
          filter: isAnimating ? "blur(0.5px)" : "blur(0px)",
          opacity: isAnimating ? 0.9 : 1,
          transitionDuration: "var(--spring-duration)",
          transitionTimingFunction: "var(--spring-easing)",
        } as React.CSSProperties
      }
    >
      {prefix}
      {displayValue}
      {suffix}
    </span>
  )
}

export function AnimatedNumberGroup({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      layout
      transition={{
        layout: {
          duration: 0.75, // transformTiming duration
          ease: "easeOut",
        },
      }}
    >
      {children}
    </motion.div>
  )
}
