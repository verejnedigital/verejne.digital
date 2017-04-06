import React from 'react';
import { Router, Route } from 'react-router';

import PrepojeniaPage from './components/PrepojeniaPage';

const Routes = props => (
  <Router {...props}>
    <Route path="*" component={PrepojeniaPage} />
  </Router>
);

export default Routes;
