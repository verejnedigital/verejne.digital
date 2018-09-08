// @flow
import React from 'react'
import Sidebar from './Sidebar/Sidebar'
import EntitySearchModal from './EntitySearch/EntitySearchModal'
import Map from './Map/Map'
import Legend from './Legend/Legend'
import './Public.css'


export default () => (
  <div className="wrapper">
    <Sidebar />
    <EntitySearchModal />
    <Map />
    <Legend />
  </div>
)
