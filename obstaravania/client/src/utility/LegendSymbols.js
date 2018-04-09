import React from 'react';

export function getWarningSymbol(level) {
  switch (level) {
    case -1:
      return <i className="fa fa-question-circle warning-1" aria-hidden="true" />;
    case -2:
      return <i className="fa fa-question-circle warning-2" aria-hidden="true" />;
    case -3:
      return <i className="fa fa-question-circle warning-3" aria-hidden="true" />;
    case 1:
      return <i className="fa fa-exclamation-triangle warning-1" aria-hidden="true" />;
    case 2:
      return <i className="fa fa-exclamation-triangle warning-2" aria-hidden="true" />;
    case 3:
      return <i className="fa fa-exclamation-triangle warning-3" aria-hidden="true" />;
    default:
      return '';
  }
}

export function getSimilarPercent(value) {
  return <span className="similarity">{value}</span>;
}

export function getSimilarCount(value) {
  return <span className="similar-count">{value}</span>;
}
