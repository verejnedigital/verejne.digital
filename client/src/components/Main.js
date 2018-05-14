import React, {Component} from 'react'
import Navigation from './Navigation'
import {Route} from 'react-router-dom'
import {Switch} from 'react-router'
import Verejne from './Verejne'
import Prepojenia from './Prepojenia'
import NoticeList from './NoticeList'
import NoticeDetail from './NoticeDetail'
import Profil from './Profil/Profil'
import DetailPage from './Profil/DetailPage'

import './Main.css'

class Main extends Component {
  render = () => [
    <Navigation key="navbar" />,
    <main key="main" role="main" className="container application-container">
      <Switch>
        <Route path="/verejne" exact component={Verejne} />
        <Route path="/prepojenia" exact component={Prepojenia} />
        <Route path="/obstaravania" exact component={NoticeList} />
        <Route path="/obstaravania/:id" component={NoticeDetail} />
        <Route path="/profil" exact component={Profil} />
        <Route path="/profil/:id" component={DetailPage} />
      </Switch>
    </main>,
  ]
}

export default Main
