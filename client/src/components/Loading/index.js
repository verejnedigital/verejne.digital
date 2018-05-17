import React from 'react'
import LoadingComponent from 'react-loading-components'
import './Loading.css'

const Loading = () => (
  <div className="Loading" >
    <LoadingComponent type="tail_spin" width={250} height={250} fill="#0062db" />
  </div>
)

export default Loading
