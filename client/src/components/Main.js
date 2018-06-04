import React, {Component} from 'react'
import Navigation from './Navigation'
import {Route} from 'react-router-dom'
import {Switch} from 'react-router'
import VerejneSidebar from './Verejne'
import Verejne from './Verejne/Map'
import Connections from './Connections/Connections'
import ConnectionsSidebar from './Connections/components/Search/Search'
import NoticeSidebar from './Notices/Legend'
import NoticeList from './Notices/NoticeList'
import NoticeDetail from './Notices/NoticeDetail'
import Profile from './Profile/Profile'
import DetailPage from './Profile/DetailPage'

import classnames from 'classnames'

import './Main.css'

class Main extends Component {
  render = () => (
    <div className="app">
      <aside className={classnames('sidebar-part', (this.props.location.pathname === '/verejne') ? 'scroll-able' : '')}>
        <Navigation key="navbar" />
        <hr />
        <Switch>
          <Route path="/verejne" exact component={VerejneSidebar} />
          <Route path="/prepojenia" exact component={ConnectionsSidebar} />
          <Route path="/obstaravania" exact component={NoticeSidebar} />
          <Route path="/obstaravania/:id" component={NoticeSidebar} />
          {/*<Route path="/profil" exact component={ProfilSidebar} />*/}
          {/*<Route path="/profil/:id" component={ProfilSidebar} />*/}
        </Switch>
      </aside>
      <main tag="main" className="content-part">
        <Switch>
          <Route path="/verejne" exact component={Verejne} />
          <Route path="/prepojenia" exact component={Connections} />
          <Route path="/obstaravania" exact component={NoticeList} />
          <Route path="/obstaravania/:id" component={NoticeDetail} />
          <Route path="/profil" exact component={Profile} />
          <Route path="/profil/:id" component={DetailPage} />
        </Switch>
      </main>
    </div>
  )
}

export default Main
