// @flow
import React from 'react'
import Sidebar from './Sidebar/Sidebar'
import EntitySearch from './EntitySearch/EntitySearch'
import Map from './Map/Map'
import Legend from './Legend/Legend'
import './Public.css'


export default () => (
  <div className="wrapper">
    <Sidebar />
    <EntitySearch />
    <Map />
    <Legend />
  </div>
)

