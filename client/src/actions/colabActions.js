// @flow
import type {Colab} from '../state'

export const setColabs = (colabs: Colab[]) => ({
  type: 'Set colabs',
  path: ['colabs'],
  payload: colabs,
  reducer: () => colabs,
})
