// @flow

export type State = {|
  +count: number,
|}

export default (): State => ({
  count: 0,
})
