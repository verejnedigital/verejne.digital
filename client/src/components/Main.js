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
    <div style={{height: '100%'}}>
      <Navbar />
      <main role="main" className="application-container">
        <Switch>
          <Route path="/verejne" exact component={Verejne} />
          <Route path="/prepojenia" exact component={Prepojenia} />
          <Route path="/obstaravania" exact component={NoticeList} />
          <Route path="/obstaravania/:id" component={NoticeDetail} />
        </Switch>
      </main>
    </div>
  )
}

export default Main
