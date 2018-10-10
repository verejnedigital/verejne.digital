// @flow
import React from 'react'
import Navigation from './Navigation'
import {Route} from 'react-router-dom'
import {Switch} from 'react-router'
import Public from './Public/Public'
import Connections from './Connections/Connections'
import NoticeList from './Notices/NoticeList'
import NoticeDetail from './Notices/NoticeDetail'
import Profile from './Profile/Profile'
import DetailPage from './Profile/DetailPage'
import Landing from './Landing/Landing'

import withTracker from './shared/withTracker'

import './App.css'

const App = () => (
  <div className="application-container">
    <Route path="/:something" component={Navigation} />
    <div className="screen-container">
      <Switch>
        <Route exact path="/" component={withTracker(Landing)} />
        <Route path="/verejne" exact component={Public} />
        {/* has tracking inside Map because of componentDidUpdate infinite loop */}
        <Route path="/prepojenia" exact component={withTracker(Connections)} />
        <Route path="/obstaravania" exact component={withTracker(NoticeList)} />
        <Route path="/obstaravania/:id" component={withTracker(NoticeDetail)} />
        <Route path="/profil" exact component={withTracker(Profile)} />
        <Route path="/profil/:id" component={withTracker(DetailPage)} />
      </Switch>
    </div>
  </div>
)

export default App
