// @flow
import type {Point} from './utils'

const GESTURE_INTERVAL = 3000 // milis
const STROKES_TO_SHAKE = 4
const MIN_STROKE_LENGTH = 20 // px

let shakes = 0
let lastPos = null
let firstPosInDir = null
let lastDir = null
let gestureTimeout = null

export const resetGesture = () => {
  gestureTimeout && clearTimeout(gestureTimeout)
  gestureTimeout = null
  lastPos = null
  lastDir = null
  shakes = 0
}

export const checkShaking = ({x, y}: Point) => {
  if (lastPos == null || lastPos === x) {
    lastPos = x
    gestureTimeout = setTimeout(() => {
      resetGesture()
    }, GESTURE_INTERVAL)
    return false
  }
  const dir = x - lastPos > 0 ? 1 : -1
  if (dir !== lastDir) {
    if (Math.abs(x - firstPosInDir) > MIN_STROKE_LENGTH) {
      shakes++
    }
    lastDir = dir
    firstPosInDir = x
  }
  lastPos = x
  if (shakes >= STROKES_TO_SHAKE) {
    resetGesture()
    return true
  }
  return false
}
