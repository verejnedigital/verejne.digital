import React, {Component} from 'react'
import Navigation from './Navigation'
import {Route} from 'react-router-dom'
import {Switch} from 'react-router'
import Verejne from './Verejne'
import Connexions from './Connexions/Connexions'
import NoticeList from './Notices/NoticeList'
import NoticeDetail from './Notices/NoticeDetail'
import Profil from './Profil/Profil'
import DetailPage from './Profil/DetailPage'

import './Main.css'

class Main extends Component {
  render = () => [
    <Navigation key="navbar" />,
    <div key="main" className="application-container">
      <Switch>
        <Route path="/verejne" exact component={Verejne} />
        <Route path="/prepojenia" exact component={Connexions} />
        <Route path="/obstaravania" exact component={NoticeList} />
        <Route path="/obstaravania/:id" component={NoticeDetail} />
        <Route path="/profil" exact component={Profil} />
        <Route path="/profil/:id" component={DetailPage} />
      </Switch>
    </div>,
  ]
}

export default Main
