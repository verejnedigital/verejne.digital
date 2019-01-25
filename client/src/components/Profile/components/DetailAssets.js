// @flow
import React from 'react'
import './DetailAssets.css'
import {Table} from 'reactstrap'
import ExternalLink from '../../shared/ExternalLink'
import {branch, compose, withState} from 'recompose'
import {withDataProviders} from 'data-provider/dist/withDataProviders'
import {imageSrcProvider} from '../../../dataProviders/profileDataProviders'

export type DetailAssetProps = {
  assets: Array<string>,
  year: string,
  title: string,
  preloadedImageSrc: string,
  source: string,
}

const DetailAssetDeclaration = ({
  assets,
  year,
  title,
  preloadedImageSrc,
  source,
}: DetailAssetProps) => (
  <Table className="assets-declaration">
    <thead>
      <tr>
        <th />
        <th>
          {title} ({assets.length}) <br />
          <span className="source">zdroj </span>
          <ExternalLink url={source}>NRSR</ExternalLink>
          <span className="source">{year !== 0 ? `rok ${year}` : ''}</span>
        </th>
      </tr>
    </thead>
    <tbody>
      {assets.map((asset, key) => (
        <tr className="asset" key={key}>
          <td className="key">{key < 9 ? `0${key + 1}` : key + 1}</td>
          <td>{asset}</td>
        </tr>
      ))}
    </tbody>
    {preloadedImageSrc && (
      <tfoot>
        <tr>
          <td colSpan="2">
            <img className="assets-declaration plot" alt="majetok" src={preloadedImageSrc} />
          </td>
        </tr>
      </tfoot>
    )}
  </Table>
)

export default compose(
  withState('preloadedImageSrc', 'setPreloadedImageSrc', undefined),
  branch(
    ({image}) => !!image,
    withDataProviders(({image, setPreloadedImageSrc, cachebreak}) => [
      imageSrcProvider(image, setPreloadedImageSrc, cachebreak),
    ])
  )
)(DetailAssetDeclaration)
