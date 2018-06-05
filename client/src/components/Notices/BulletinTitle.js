import React from 'react'
import ExternalLink from '../shared/ExternalLink'

const BulletinTitle = (notice, newestBulletinDate) => (
  <span>
    <strong>{newestBulletinDate}</strong> Vestník číslo{' '}
    <ExternalLink
      url={`https://www.uvo.gov.sk/evestnik?poradie=${notice.bulletin_number}&year=${notice.bulletin_year}`}
      text={
        <strong>
          {notice.bulletin_number}/{notice.bulletin_year}
        </strong>
      }
    />
  </span>
)

export default BulletinTitle
