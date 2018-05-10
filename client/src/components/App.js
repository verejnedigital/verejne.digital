import React from 'react'
import {Route, Switch, Redirect} from 'react-router-dom'
import Landing from './Landing'
import Main from './Main'
import './App.css'

const App = () => (
  <Switch>
    <Route path="/" exact component={Landing} />
    <Route path="/verejne" component={Main} />
    <Route path="/prepojenia" component={Main} />
    <Route path="/obstaravania" component={Main} />
    <Redirect to="/" />
  </Switch>
)

export default App
