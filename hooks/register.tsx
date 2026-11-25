import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import type { Meter } from '../types'
import { makeColors } from './make-colors.js'

// Palette from bttr-website-2026/app/src/app.css
const ORANGE = '#ff1e00'
const ORANGE_TEXT = '#e61b00' // white on this passes 4.5:1, on ORANGE it does not
const DARK_RED = '#4f0d04'
const CREAM = '#f3eadd'
const CREAM_40 = '#faf7f1'
const SKY = '#8fc7ff'
const NIGHT = '#2a0702' // dark mode: the hero card's dark red, one step deeper

const { theme, problems } = makeColors({
  label: 'BTTR',
  // Links follow the accent, so the accent is the site's sky blue; orange stays in the mod's own drawings.
  roles: { accent: SKY, danger: '#c0001a', success: '#2e7d4f', warning: '#b26a00', pro: ORANGE },
  light: {
    gray: {
      anchors: {
        'surface-0': CREAM,
        'surface-1': CREAM_40,
        'surface-2': '#ffffff',
        'text-primary': DARK_RED,
        'text-secondary': '#6b2a1f',
        'text-muted': '#7a4136',
      },
    },
  },
  dark: {
    gray: {
      anchors: {
        'surface-0': NIGHT,
        'surface-1': '#330a04',
        'surface-2': '#3b0d06',
        'surface-3': '#401009',
        'text-primary': CREAM,
        'text-secondary': '#dccbb9',
        'text-muted': '#bba491',
      },
    },
  },
})

// The person's message: dark red in light mode, orange in dark mode; makeColors doesn't take these.
const colors = {
  ...theme,
  inputs: {
    light: { ...theme.inputs.light, 'bg-user-message': DARK_RED, 'text-user-message': '#ffffff' },
    dark: { ...theme.inputs.dark, 'bg-user-message': ORANGE_TEXT, 'text-user-message': '#ffffff' },
  },
} satisfies typeof theme

const LOOK: ThemeSetArgs = { colors, backdrop: { scene: 'rail' } }
const STYLE: ThemeSetArgs['style'] = {
  Heading: { fontWeight: 'regular', letterSpacing: -1 },
  // The site's primary button shape, rounded-lg.
  UserMessage: { backgroundColor: 'bg-user-message', color: 'text-user-message', radius: 8, paddingX: 16, paddingY: 10 },
}

const EMPTY: Meter = { percent: null, previous: null, tokens: null, window: null }
const meter = atom({ plugin: 'bttr-context', key: 'meter' } as const, EMPTY)

const clamp = (percent: number | null) => Math.min(Math.max(percent ?? 0, 0), 100)

// The rail runs from TOP to BOTTOM in its own 160 x 1000 box.
const TOP = 86
const BOTTOM = 914
export const railY = (percent: number | null) => TOP + (clamp(percent) / 100) * (BOTTOM - TOP)

// divider-center.svg from the site: the notch in its section dividers.
const NOTCH = 'M35 1C25.6 1 18 8.6 18 18V47.5C18 47.8 17.8 48 17.5 48C17.2 48 17 47.8 17 47.5V18C17 8.6 9.4 1 0 1V0H35Z'

// logo.svg from the site, 74 x 32.
const LOGO = 'M57.0381 0V31.9632H63.4635V19.9698C63.4635 19.3239 63.9914 18.7988 64.6408 18.7988H66.3778C67.0272 18.7988 67.5552 19.3239 67.5552 19.9698V31.9632H73.9805V22.254C73.9805 20.5211 73.6532 19.2451 72.9774 18.3472C72.3808 17.5543 71.4832 17.0134 70.158 16.6564L70.0472 16.6249V15.3436L70.158 15.3121C71.4832 14.9498 72.3808 14.4142 72.9774 13.6212C73.6532 12.7233 73.9805 11.4473 73.9805 9.71446V6.35378C73.9805 4.56842 73.3575 2.94584 72.2277 1.78536C71.1031 0.635378 69.5456 0 67.8403 0H57.0381ZM64.6408 5.63439H66.3778C67.0272 5.63439 67.5552 6.15949 67.5552 6.80537V11.9934C67.5552 12.6393 67.0272 13.1644 66.3778 13.1644H64.6408C63.9914 13.1644 63.4635 12.6393 63.4635 11.9934V6.80537C63.4635 6.15949 63.9914 5.63439 64.6408 5.63439Z M38.0254 0V5.63439H42.0591C42.7085 5.63439 43.2364 6.15949 43.2364 6.80537V31.9579H49.6617V6.80537C49.6617 6.15949 50.1897 5.63439 50.8391 5.63439H54.9678V0H38.0254Z M19.0127 0V5.63439H23.0464C23.6958 5.63439 24.2237 6.15949 24.2237 6.80537V31.9579H30.649V6.80537C30.649 6.15949 31.177 5.63439 31.8264 5.63439H35.9551V0H19.0127Z M10.8021 0H0V31.9579H11.0872C12.7767 31.9579 14.2286 31.3646 15.2898 30.2356C16.3722 29.0856 16.9424 27.484 16.9424 25.6094V22.2487C16.9424 20.5159 16.615 19.2346 15.9392 18.3419C15.3426 17.549 14.4451 17.0082 13.1199 16.6511L13.009 16.6196V15.3331L13.1199 15.3016C14.4451 14.9393 15.3426 14.4037 15.9392 13.6107C16.615 12.7128 16.9424 11.4368 16.9424 9.70396V6.34328C16.9424 4.55792 16.3194 2.93534 15.1895 1.77486C14.0702 0.635378 12.5127 0 10.8021 0ZM10.517 11.9934C10.517 12.6393 9.98907 13.1644 9.33967 13.1644H7.60268C6.95328 13.1644 6.42532 12.6393 6.42532 11.9934V6.80537C6.42532 6.15949 6.95328 5.63439 7.60268 5.63439H9.33967C9.98907 5.63439 10.517 6.15949 10.517 6.80537V11.9934ZM6.42532 19.9698C6.42532 19.3239 6.95328 18.7988 7.60268 18.7988H9.33967C9.98907 18.7988 10.517 19.3239 10.517 19.9698V25.1578C10.517 25.8037 9.98907 26.3288 9.33967 26.3288H7.60268C6.95328 26.3288 6.42532 25.8037 6.42532 25.1578V19.9698Z'

export const scene = ({ percent, previous }: Meter) => {
  const y = railY(percent)
  const before = railY(previous ?? percent)
  const length = y - TOP
  const grownFrom = length > 0 ? (before - TOP) / length : 1
  const isHigh = clamp(percent) >= 80
  const label = percent === null ? '' : `${percent}%`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
<style>
.bg { fill: ${CREAM} }
.line { stroke: ${DARK_RED}; fill: none; stroke-width: 1.5 }
.notch { fill: ${DARK_RED} }
.fill { stroke: ${ORANGE}; stroke-width: 4; stroke-linecap: round }
.dot { fill: ${isHigh ? ORANGE : DARK_RED} }
.ring { fill: none; stroke: ${isHigh ? ORANGE : DARK_RED}; stroke-width: 2; opacity: 0 }
.logo { fill: ${ORANGE} }
.pct { fill: ${DARK_RED}; font: 500 20px sans-serif; letter-spacing: -0.5px }
.move { animation: move 2.4s cubic-bezier(.2,.7,.2,1) both }
.grow { transform-box: view-box; transform-origin: 0 ${TOP}px; animation: grow 2.4s cubic-bezier(.2,.7,.2,1) both }
.ring { transform-box: fill-box; transform-origin: center; animation: pulse 3.2s ease-out infinite }
@keyframes move { from { transform: translateY(${before - y}px) } to { transform: translateY(0) } }
@keyframes grow { from { transform: scaleY(${grownFrom}) } to { transform: scaleY(1) } }
@keyframes pulse { from { transform: scale(1); opacity: .45 } to { transform: scale(2.6); opacity: 0 } }
@media (prefers-color-scheme: dark) {
  .bg { fill: ${NIGHT} }
  .line { stroke: ${CREAM}; opacity: .45 }
  .notch { fill: ${CREAM}; opacity: .45 }
  .dot { fill: ${isHigh ? ORANGE : CREAM} }
  .ring { stroke: ${isHigh ? ORANGE : CREAM} }
  .pct { fill: ${CREAM} }
}
</style>
<rect class="bg" width="100%" height="100%"/>
<svg width="100%" height="100%" viewBox="0 0 160 1000" preserveAspectRatio="xMaxYMid meet">
<path class="line" d="M64 70H108Q124 70 124 86V914Q124 930 108 930H64"/>
<path class="notch" transform="translate(124.75 482.5) rotate(90)" d="${NOTCH}"/>
${length > 0 ? `<line class="fill grow" x1="124" y1="${TOP}" x2="124" y2="${y}"/>` : ''}
<path class="logo" transform="translate(50 952)" d="${LOGO}"/>
<g class="move">
<circle class="ring" cx="124" cy="${y}" r="11"/>
<circle class="dot" cx="124" cy="${y}" r="11"/>
<text class="pct" x="100" y="${y + 7}" text-anchor="end">${label}</text>
</g>
</svg>
</svg>`
}

async function refresh($: EngineInterface) {
  try {
    const { context } = await $.session.usage()
    const percent = context.percent ?? null
    const tokens = context.tokens ?? null
    await update($, meter, old =>
      old.percent === percent && old.tokens === tokens ? old : { percent, previous: old.percent, tokens, window: context.window },
    )
  } catch (error) {
    // The meter is decoration: never let it fail a tool call or a compaction.
    $.ui.log(`bttr-context: ${String(error)}`)
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }

    try {
      await $.theme.set({ ...LOOK, style: STYLE })
    } catch (error) {
      $.ui.log(`bttr-context: style refused, look only: ${String(error)}`)
      await $.theme.set(LOOK)
    }
    await refresh($)

    return next(e)
  })

  // A tool call ends a model response, so the figure moves mid-turn too.
  on('tool.call', async ($, e, next) => {
    const result = await next(e)
    await refresh($)

    return result
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    await refresh($)

    return result
  })

  on('session.compact', async ($, e, next) => {
    const result = await next(e)
    await refresh($)

    return result
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== 'rail') {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)
    const current = await read($, meter)
    const alt = current.percent === null ? 'A progress rail, empty' : `A progress rail at ${current.percent}% of the context window`

    return <Svg source={scene(current)} alt={alt} />
  })
}
