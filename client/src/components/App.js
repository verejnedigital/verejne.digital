import React from 'react'
import {Route, Switch, Redirect} from 'react-router-dom'
import Landing from './Landing'
import Prepojenia from './Prepojenia'
import Verejne from './Verejne'
import Obstaravania from './Obstaravania'

const App = () => (
  <Switch>
    <Route path="/" exact component={Landing} />
    <Route path="/verejne" exact component={Verejne} />
    <Route path="/prepojenia" component={Prepojenia} />
    <Route path="/obstaravania" exact component={Obstaravania} />
    <Redirect to="/" />
  </Switch>
)

export default App
