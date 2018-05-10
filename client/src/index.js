// polyfills
import 'regenerator-runtime/runtime'
import 'whatwg-fetch'
import Promise from 'bluebird'

import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import {BrowserRouter} from 'react-router-dom'
import App from './components/App'
import getConfiguredStore from './configureStore'
import {Provider} from 'react-redux'

import './custom.css'

window.Promise = Promise

// a short-term fix for data-provider, should get fixed in next release
class DispatchProvider extends React.Component {
  static childContextTypes = {
    dispatch: PropTypes.func,
  }

  getChildContext() {
    return {dispatch: this.props.dispatch}
  }

  render() {
    return <div> {this.props.children} </div>
  }
}

const store = getConfiguredStore()
ReactDOM.render(
  <Provider store={store}>
    <BrowserRouter>
      <DispatchProvider dispatch={store.dispatch}>
        <App />
      </DispatchProvider>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
)
