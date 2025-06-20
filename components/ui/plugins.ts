import type NumberFlowLite from "./number-flow-lite"

export interface Plugin {
  name?: string
  onUpdate?: (data: any, prev: any, flow: NumberFlowLite) => void
  getDelta?: (value: number, prev: number, digit: any) => number | undefined
}

// Simplified continuous plugin
export const continuous: Plugin = {
  name: "continuous",
  onUpdate(data, prev, flow) {
    // Simplified implementation
  },
  getDelta(value, prev, digit) {
    // Simplified implementation
    return undefined
  },
}
