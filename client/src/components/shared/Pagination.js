// @flow
import React from 'react'
import {Link} from 'react-router-dom'
import {Pagination, PaginationItem, PaginationLink} from 'reactstrap'
import {modifyQuery} from '../../utils'

type PaginationProps = {
  maxPage: number,
  currentPage: number,
  currentQuery: string,
}

const CustomPagination = ({maxPage, currentQuery, currentPage}: PaginationProps) => {
  return (
    <Pagination>
      {currentPage > 1 && (
        <PaginationItem>
          <PaginationLink
            previous
            tag={Link}
            to={{search: modifyQuery(currentQuery, {page: currentPage - 1})}}
          />
        </PaginationItem>
      )}

      {Array(...Array(maxPage)).map((_, i) => (
        <PaginationItem key={i}>
          <PaginationLink tag={Link} to={{search: modifyQuery(currentQuery, {page: i + 1})}}>
            {i + 1}
          </PaginationLink>
        </PaginationItem>
      ))}
      {currentPage < maxPage && (
        <PaginationItem>
          <PaginationLink
            next
            tag={Link}
            to={{search: modifyQuery(currentQuery, {page: currentPage + 1})}}
          />
        </PaginationItem>
      )}
    </Pagination>
  )
}

export default CustomPagination
