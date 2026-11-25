export type Meter = {
  percent: number | null
  previous: number | null
  tokens: number | null
  window: number | null
}

declare module 'claude-code' {
  interface PluginState {
    'bttr-context': { meter: Meter }
  }
}
