// @flow
export type PathElement = number | string
export type Path = Array<PathElement>

export type GenericAction<Segment, Payload> = {
  +type: string,
  +path?: Path,
  +payload?: Payload,
  +reducer: SegmentReducer<Segment, Payload>,
  +doNotTrack?: boolean,
}

export type SegmentReducer<Segment, Payload> = (state: Segment, payload: Payload) => Segment
export type Dispatch = (action: GenericAction<*, *>) => null
export type Thunk = (dispatch: Dispatch, getState: any) => Promise<void>
