// @flow
// TODO remove this, it's an example on flow + react/redux

import React from 'react'
import {Button} from 'reactstrap'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import {addCount} from '../actions/exampleActions'
import type {Dispatch} from '../types/reduxTypes'

const Counter = ({count, addCount}: {count: number, addCount: () => void}) => (
  <div>
    {count}
    <Button onClick={addCount}>Add</Button>
  </div>
)

export default connect(
  (state) => ({count: state.exampleCounter}),
  (dispatch: Dispatch) => bindActionCreators({addCount}, dispatch)
)(Counter)
