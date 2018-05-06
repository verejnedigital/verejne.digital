// @flow

export type State = {|
  +count: number,
  +obstaravania: {|
    +data: ?Object,
  |},
  +activeProviderPromises: {
    [string]: Promise<any>,
  },
|}

export default (): State => ({
  count: 0,
  obstaravania: {
    data: undefined,
  },
  activeProviderPromises: {},
})
