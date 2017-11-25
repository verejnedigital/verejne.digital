import React from 'react';
import { Router, Route } from 'react-router';

import App from './App';
import DetailPage from './DetailPage';

const Routes = props => (
  <Router {...props}>
    <Route path="/detail/:id" component={DetailPage} />
    <Route path="*" component={App} />
  </Router>
);

export default Routes;
