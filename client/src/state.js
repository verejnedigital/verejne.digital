// @flow

export type State = {
  +test: string,
}

export default (): State => ({
  test: 'state',
})
