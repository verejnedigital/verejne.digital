// polyfills
import 'regenerator-runtime/runtime'
import 'whatwg-fetch'
import Promise from 'bluebird'

import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import {BrowserRouter} from 'react-router-dom'
import {dataProvidersConfig} from 'data-provider'
import './customBootstrap.css'
import App from './components/App'
import Loading from './components/Loading/Loading'
import getConfiguredStore from './configureStore'
import {Provider} from 'react-redux'

window.Promise = Promise

dataProvidersConfig({loadingComponent: <Loading />})

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
    <BrowserRouter basename={process.env.REACT_APP_BASENAME}>
      <DispatchProvider dispatch={store.dispatch}>
        <App />
      </DispatchProvider>
    </BrowserRouter>
  </Provider>,
  document.getElementById('root')
)
