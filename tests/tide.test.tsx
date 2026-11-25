import { expect, test } from 'claude-code/testing'

import { railY, scene } from '../hooks/register'

const STORED = { value: { percent: 62, previous: 40, tokens: 124_000, window: 200_000 }, version: 1 }

test('the rail dot clamps to the rail ends', async () => {
  expect(railY(null)).toBe(86)
  expect(railY(50)).toBe(500)
  expect(railY(140)).toBe(914)
})

test('the scene labels the figure and turns the dot orange from 80%', async () => {
  expect(scene({ percent: 40, previous: 30, tokens: 1, window: 2 })).toContain('>40%<')
  expect(scene({ percent: 85, previous: 70, tokens: 1, window: 2 })).toContain('.dot { fill: #ff1e00 }')
  expect(scene({ percent: null, previous: null, tokens: null, window: null })).not.toContain('%<')
  expect(scene({ percent: null, previous: null, tokens: null, window: null })).toContain('class="logo"')
})

test('the backdrop draws the stored figure on desktop', async ($, on) => {
  on('state.get', () => ({ value: STORED }))

  const ui = await $.ui.mount({
    plugin: 'bttr-context',
    component: 'Backdrop',
    surface: 'desktop',
    props: { scene: 'rail', plugin: 'bttr-context', glass: false },
  })

  expect(String((await ui.find({ type: 'Svg' }))?.props.source)).toContain('>62%<')
  await ui.unmount()
})
