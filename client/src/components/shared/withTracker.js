/**
 * From ReactGA Community Wiki Page
 * https://github.com/react-ga/react-ga/wiki/React-Router-v4-withTracker
 */

import React, {Component} from 'react'
import ReactGA from 'react-ga'

export default function withTracker(WrappedComponent, options = {}) {
  const trackPage = (page) => {
    ReactGA.set({
      page,
      ...options,
    })
    ReactGA.pageview(page)
  }

  const HOC = class extends Component {
    componentDidMount() {
      if (process.env.NODE_ENV === 'production') {
        const page = this.props.location.pathname
        trackPage(page)
      }
    }

    render() {
      return <WrappedComponent {...this.props} />
    }
  }

  return HOC
}
