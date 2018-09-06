// @flow
import QuestionCircle from 'react-icons/lib/fa/question-circle'
import ExclamationTriangle from 'react-icons/lib/fa/exclamation-triangle'
import classnames from 'classnames'
import React from 'react'

export function getWarningSymbol(level: number) {
  if (level < 0) {
    return <QuestionCircle className={classnames('warning', `warning${level}`)} />
  } else if (level > 0) {
    return <ExclamationTriangle className={classnames('warning', `warning-${level}`)} />
  } else {
    return ''
  }
}

export function formatSimilarPercent(value: number) {
  let style
  if (value > 75) style = 'similarity-high'
  else if (value > 50) style = 'similarity-medium'
  else if (value > 25) style = 'similarity-low'
  else style = ''

  return <span className={classnames('similarity', style)}>{value}%</span>
}

export function formatSimilarCount(value: number) {
  return (
    <span className="similar-count" title={value}>
      {value > 20 ? '20+' : value}
    </span>
  )
}
