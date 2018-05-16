// @flow
import React from 'react'
import GoogleMap from './GoogleMap'
import './Verejne.css'
import Legend from './Legend'
import {Container, Input} from 'reactstrap'

const Verejne = () => (
  <div className="wrapper Wrapper">
    <div className="stream SidePanel">
      <Container className="Search">
        <Input type="text" className="FormControl" placeholder="Hľadaj firmu / človeka" />
        <Input type="text" className="FormControl" placeholder="Hľadaj adresu" />
      </Container>
    </div>
    <GoogleMap />
    <Legend />
  </div>
)
export default Verejne
