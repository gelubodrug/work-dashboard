import type { Plugin } from "./plugins"

export interface NumberFlowOptions {
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
  prefix?: string
  suffix?: string
  onAnimationsStart?: () => void
  onAnimationsFinish?: () => void
}

export default class NumberFlowLite {
  private element: HTMLElement
  private options: NumberFlowOptions
  private currentValue: number
  private formatter: Intl.NumberFormat

  constructor(element: HTMLElement, options: NumberFlowOptions) {
    this.element = element
    this.options = { ...options }
    this.currentValue = options.value
    this.formatter = new Intl.NumberFormat(options.locales, options.format)

    this.render()
  }

  update(newOptions: Partial<NumberFlowOptions>) {
    const oldValue = this.currentValue
    this.options = { ...this.options, ...newOptions }

    if (newOptions.value !== undefined && newOptions.value !== oldValue) {
      this.currentValue = newOptions.value
      this.animate(oldValue, this.currentValue)
    }
  }

  private render() {
    const formatted = this.formatter.format(this.currentValue)
    const prefix = this.options.prefix || ""
    const suffix = this.options.suffix || ""
    this.element.textContent = `${prefix}${formatted}${suffix}`
  }

  private animate(from: number, to: number) {
    if (!this.options.animated) {
      this.render()
      return
    }

    // Simple animation - in real implementation this would be much more complex
    const duration = 600
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function
      const eased = 1 - Math.pow(1 - progress, 3)
      const currentValue = from + (to - from) * eased

      const formatted = this.formatter.format(Math.round(currentValue))
      const prefix = this.options.prefix || ""
      const suffix = this.options.suffix || ""
      this.element.textContent = `${prefix}${formatted}${suffix}`

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        this.options.onAnimationsFinish?.()
      }
    }

    this.options.onAnimationsStart?.()
    requestAnimationFrame(animate)
  }

  destroy() {
    // Cleanup if needed
  }
}
