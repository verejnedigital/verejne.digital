import React from 'react';
import { Router, Route } from 'react-router';

import PrepojeniaPage from './App';

const Routes = props => (
  <Router {...props}>
    <Route path="/prepojenia" component={PrepojeniaPage} />
  </Router>
);

export default Routes;
