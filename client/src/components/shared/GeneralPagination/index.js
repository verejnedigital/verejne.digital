// @flow
import React from 'react'
import {Pagination, PaginationItem, PaginationLink} from 'reactstrap'
import {range} from 'lodash'
import classnames from 'classnames'
import './Pagination.css'

type PaginationProps = {
  pageCount: number,
  maxPages: number,
  currentPage: number,
  onPaginationClick: (page: number) => void,
}

const getPageRange = ({pageShowCount, currentPage, pageCount}) => {
  const totalButtons = pageShowCount + 2, rangeLimit = pageCount + 2
  const pageRange = {
    from: currentPage - Math.floor(totalButtons / 2),
    to: currentPage + Math.floor(totalButtons / 2),
  }
  if (pageRange.to - pageRange.from !== totalButtons) pageRange.to++
  if (pageRange.from < 0) {
    pageRange.to += -pageRange.from
    pageRange.from = 0
  }
  if (pageRange.to > rangeLimit) {
    pageRange.from -= pageRange.to - rangeLimit
    pageRange.to = rangeLimit
  }
  return pageRange
}

const getNextPage = ({currentPage, page, from, to, pageCount}) => {
  if (page === from) return Math.max(1, currentPage - 1)
  else if (page === to - 1) return Math.min(pageCount, currentPage + 1)
  return page
}

const GeneralPagination = ({
  pageCount, maxPages, currentPage, onPaginationClick,
}: PaginationProps) => {
  const pageShowCount = Math.min(maxPages, pageCount)
  const {from, to} = getPageRange({pageShowCount, currentPage, pageCount})
  return (
    <Pagination className="GeneralPagination">
      {
        range(from, to).map((page) => (
          <PaginationItem
            key={page}
            onClick={() => onPaginationClick && onPaginationClick(
              getNextPage({currentPage, page, from, to, pageCount})
            )}
          >
            <PaginationLink
              className={classnames('GeneralPagination__Item__Link', {GeneralPagination__Item__Link__Current: page === currentPage})}
              previous={page === from} next={page === to - 1}
            >
              {page !== from && page !== to - 1 && page}
            </PaginationLink>
          </PaginationItem>
        ))
      }
    </Pagination>
  )
}

export default GeneralPagination
