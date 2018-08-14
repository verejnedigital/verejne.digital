// @flow
import React from 'react'
import LoadingComponent from 'react-loading-components'
import './Loading.css'
import {defaultProps} from 'recompose'
import {ListGroupItem} from 'reactstrap'
import {LOADING_CIRCLE_COLOR} from '../../constants'

type Props = {
  width: number,
  height: number,
}

const Loading = ({width, height}: Props) => (
  <div className="loading">
    <LoadingComponent type="tail_spin" width={width} height={height} fill={LOADING_CIRCLE_COLOR} />
  </div>
)
export const EntityDetailLoading = () => (
  <ListGroupItem className="list-row">
    <div className="loadingsmall list-row-item">
      <LoadingComponent type="tail_spin" width={15} height={15} fill={LOADING_CIRCLE_COLOR} />
    </div>
  </ListGroupItem>
)
export const ModalLoading = () => (
  <div className="loading-modal">
    <LoadingComponent type="tail_spin" width={250} height={250} fill={LOADING_CIRCLE_COLOR} />
    {console.log(LOADING_CIRCLE_COLOR)}
  </div>
)
export default defaultProps({
  width: 250,
  height: 250,
})(Loading)
