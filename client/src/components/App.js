import React from 'react'
import {Route, Switch, Redirect} from 'react-router-dom'
import Landing from './Landing'
import Prepojenia from './Prepojenia'
import Verejne from './Verejne'
import Obstaravania from './Obstaravania'
import Example from './Example'

const App = () => (
  <Switch>
    <Route path="/" exact component={Landing} />
    <Route path="/verejne" component={Verejne} />
    <Route path="/prepojenia" component={Prepojenia} />
    <Route path="/obstaravania" component={Obstaravania} />
    <Route path="/example" component={Example} />
    <Redirect to="/" />
  </Switch>
)

export default App
