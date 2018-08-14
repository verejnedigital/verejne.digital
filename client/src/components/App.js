import React, {Fragment} from 'react'
import Navigation from './Navigation'
import {Route} from 'react-router-dom'
import {Switch} from 'react-router'
import Verejne from './Verejne'
import Connections from './Connections/Connections'
import NoticeList from './Notices/NoticeList'
import NoticeDetail from './Notices/NoticeDetail'
import Profile from './Profile/Profile'
import DetailPage from './Profile/DetailPage'
import Landing from './Landing/Landing'

import './App.css'

export default (props) => (
  <Fragment>
    <Route path="/:something" component={Navigation} />
    <div className="application-container">
      <Switch>
        <Route exact path="/" component={Landing} />
        <Route path="/verejne" exact component={Verejne} />
        <Route path="/prepojenia" exact component={Connections} />
        <Route path="/obstaravania" exact component={NoticeList} />
        <Route path="/obstaravania/:id" component={NoticeDetail} />
        <Route path="/profil" exact component={Profile} />
        <Route path="/profil/:id" component={DetailPage} />
      </Switch>
    </div>
  </Fragment>
)
