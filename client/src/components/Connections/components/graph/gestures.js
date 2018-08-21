// @flow
import type {Point} from './utils'

const GESTURE_INTERVAL = 3000 // milis
const STROKES_TO_SHAKE = 5
const MIN_STROKE_LENGTH = 20 // px

let shakes = 0
let lastX = null
let lastY = null
let firstXInDir = 0
let lastDir = null
let gestureTimeout = null

export const resetGesture = () => {
  gestureTimeout && clearTimeout(gestureTimeout)
  gestureTimeout = null
  lastX = lastY = null
  lastDir = null
  shakes = 0
}

export const checkShaking = ({x, y}: Point) => {
  if (lastX == null || lastY == null || lastX === x) {
    // start gesture
    lastX = firstXInDir = x
    lastY = y
    gestureTimeout = setTimeout(() => {
      resetGesture() // gesture must be finished before GESTURE_INTERVAL ends
    }, GESTURE_INTERVAL)
    return false
  }
  const dir = x - lastX > 0 ? 1 : -1
  if (dir !== lastDir && Math.abs(y - lastY) < 2 * MIN_STROKE_LENGTH) {
    // if x direction changed, while y movement is small enough:
    if (Math.abs(x - firstXInDir) > MIN_STROKE_LENGTH) {
      // if x movement is big enough, consider this a 'shake' stroke
      shakes++
    }
    lastDir = dir
    firstXInDir = x
  }
  lastX = x
  if (shakes >= STROKES_TO_SHAKE) {
    // if enough shakes, consider this a shaking gesture
    resetGesture()
    return true
  }
  return false
}
