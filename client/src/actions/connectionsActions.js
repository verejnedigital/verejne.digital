// @flow

export const setAddNeighboursLimit = (limit: string | null) => ({
  type: 'Set add neighbours limit',
  path: ['connections', 'addNeighboursLimit'],
  payload: limit,
  reducer: () => limit,
})
