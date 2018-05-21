import React, {Component} from 'react'
import './DetailAssets.css'
import {Table} from 'reactstrap'
import ExternalLink from 'react-icons/lib/fa/external-link'

class DetailAssetDeclaration extends Component {
  constructor(props) {
    super(props)
    this.state = {
      seachedForImageOnServer: false,
      isImageOnServer: false,
    }
  }

  componentWillMount() {
    this.checkImage(this.props.image)
  }

  checkImage(imageSrc) {
    if (imageSrc && !this.state.seachedForImageOnServer) {
      this.setState({
        seachedForImageOnServer: true,
      })
      const img = new Image()
      img.onload = () => {
        this.setState({
          isImageOnServer: true,
        })
      }
      img.src = imageSrc
    }
  }

  render() {
    const {assets, year, title, image, source} = this.props
    return (
      <Table className="assets-declaration">
        <thead>
          <tr>
            <th />
            <th>
              {title} ({assets.length}) <br />
              <span className="source">zdroj </span>
              <a href={source} target="_BLANK">
                NRSR <ExternalLink />
              </a>
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
        {this.state.isImageOnServer && (
          <tfoot>
            <tr>
              <td colSpan="2">
                <img className="assets-declaration plot" alt="majetok" src={image} />
              </td>
            </tr>
          </tfoot>
        )}
      </Table>
    )
  }
}

export default DetailAssetDeclaration
