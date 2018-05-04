import React, {Component} from 'react'
import Navbar from './Navbar'
import {Route} from 'react-router-dom'
import {Switch} from 'react-router'
import Verejne from './Verejne'
import Prepojenia from './Prepojenia'
import NoticeList from './NoticeList'
import NoticeDetail from './NoticeDetail'
import './Main.css'

class Main extends Component {
  render = () => (
    [
      <Navbar key="navbar" />,
      <main key="main" role="main" className="container application-container">
        <Switch>
          <Route path="/verejne" exact component={Verejne} />
          <Route path="/prepojenia" exact component={Prepojenia} />
          <Route path="/obstaravania" exact component={NoticeList} />
          <Route path="/obstaravania/:id" component={NoticeDetail} />
        </Switch>
      </main>,
    ]
  )
}

export default Main
