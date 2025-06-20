import type NumberFlowLite from "./lite"

export interface Plugin {
  onUpdate?(data: any, prev: any, flow: NumberFlowLite): void
  getDelta?(value: number, prev: number, digit: any): number | undefined
}
