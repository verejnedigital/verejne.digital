import React from 'react';
import { Router, Route, IndexRoute } from 'react-router';
import ObstaravaniaPage from './components/MainPage';
import ObstaravaniaList from './components/MainList';
import Detail from './components/DetailPage';

const Routes = props => (
  <Router {...props}>
    <Route path="/" component={ObstaravaniaPage}>
      <IndexRoute component={ObstaravaniaList} />
      <Route path="/detail/:id" component={Detail} />
    </Route>
  </Router>
);

export default Routes;
