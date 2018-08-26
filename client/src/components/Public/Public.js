// @flow
import React from 'react'
import Sidebar from './Sidebar/Sidebar'
import Map from './Map/Map'
import Legend from './Legend/Legend'
import './Public.css'


export default () => (
  <div className="wrapper">
    <Sidebar />
    <Map />
    <Legend />
  </div>
)
