import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter} from 'react-router-dom'
import App from './App'
import getConfiguredStore from './configureStore'
import {Provider} from 'react-redux'

import 'bootstrap/dist/css/bootstrap.min.css'

const store = getConfiguredStore()
ReactDOM.render(
  <BrowserRouter>
    <Provider store={store}>
      <App />
    </Provider>
  </BrowserRouter>,
  document.getElementById('root')
)
