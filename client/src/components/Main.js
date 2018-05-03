import React, {Component} from 'react'
import Navbar from './Navbar'
import {Route} from 'react-router-dom'
import {Switch} from 'react-router'
import Verejne from './Verejne'
import Prepojenia from './Prepojenia'
import Obstaravania from './Obstaravania'
import './Main.css'

class Main extends Component {
  render = () => (
    <div>
      <Navbar />
      <main role="main" className="container application-container">
        <Switch>
          <Route path="/verejne" component={Verejne} />
          <Route path="/prepojenia" component={Prepojenia} />
          <Route path="/obstaravania" component={Obstaravania} />
        </Switch>
      </main>
    </div>
  )
}

export default Main
