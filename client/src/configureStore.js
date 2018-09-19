// @flow
import thunk from 'redux-thunk'
import {createStore, applyMiddleware} from 'redux'
import {createLogger} from 'redux-logger'
import rootReducer from './rootReducer'
import getInitialState from './state'

export default () => {
  const logger = {
    log: () => null,
  }
  const loggerMiddleware = createLogger({
    collapsed: true,
    predicate: (getState, action) => !action.doNotLog,
  })

  const middlewares = [thunk.withExtraArgument({logger})]
  if (process.env.NODE_ENV === 'development') {
    middlewares.push(loggerMiddleware)
  }

  const store = createStore(rootReducer, getInitialState(), applyMiddleware(...middlewares))

  if (process.env.NODE_ENV === 'development') {
    logger.log = (message, payload) =>
      store.dispatch({
        type: message,
        payload,
      })
  }

  return store
}
