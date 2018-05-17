// @flow
import React from 'react'
import GoogleMap from './GoogleMap'
import './Verejne.css'
import Legend from './Legend'
import {Input, ListGroup, ListGroupItem, Badge} from 'reactstrap'

const Verejne = () => (
  <div className="Wrapper">
    <div className="SidePanel">
      <Input type="text" className="FormControl" placeholder="Hľadaj firmu / človeka" />
      <Input type="text" className="FormControl" placeholder="Hľadaj adresu" />
      <ListGroup>
        <ListGroupItem>
        Cras justo odio
          <Badge pill className="SidePanel__List__Item__Badge">14</Badge>
        </ListGroupItem>
      </ListGroup>
    </div>
    <GoogleMap />
    <Legend />
  </div>
)
export default Verejne
