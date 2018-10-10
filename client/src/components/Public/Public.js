// @flow
import React from 'react'
import Sidebar from './Sidebar/Sidebar'
import EntitySearchModal from './EntitySearch/EntitySearchModal'
import Map from './Map/Map'
import Legend from '../shared/Legend/Legend'
import './Public.css'

const Public = () => (
  <div className="wrapper">
    <Sidebar />
    <EntitySearchModal />
    <Map />
    <Legend positionAbsolute closable />

  </div>
)

export default Public
