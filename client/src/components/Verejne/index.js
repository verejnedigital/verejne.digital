// @flow
import React from 'react'
import Sidebar from './Sidebar/Sidebar'
import EntitySearch from './EntitySearch'
import Map from './Map'
import Legend from './Legend'
import './Verejne.css'


export default () => (
  <div className="wrapper">
    <Sidebar />
    <EntitySearch />
    <Map />
    <Legend />
  </div>
)

