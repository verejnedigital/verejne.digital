import React from 'react';
import { Router, Route, IndexRoute } from 'react-router';
import Main from './components/Main';
import MainPage from './components/MainPage';
import DetailPage from './components/DetailPage';

const Routes = props => (
  <Router {...props}>
    <Route path="/" component={Main}>
      <IndexRoute component={MainPage} />
      <Route path="/detail/:id" component={DetailPage} />
    </Route>
  </Router>
);

export default Routes;
