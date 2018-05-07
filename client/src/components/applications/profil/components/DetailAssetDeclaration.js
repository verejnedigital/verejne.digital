import React, {Component} from 'react'
import './DetailAssetDeclaration.css'


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

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.isImageOnServer !== nextState.isImageOnServer) {
      return true
    }

    if (this.props.assets !== nextProps.assets) {
      return true
    }
    if (this.props.year !== nextProps.year) {
      return true
    }
    if (this.props.title !== nextProps.title) {
      return true
    }
    if (this.props.source !== nextProps.source) {
      return true
    }

    return false
  }

  render() {
    const {assets, year, title, image, source} = this.props
    return (
      <table className="assets-declaration table">
        <thead>
          <tr>
            <th />
            <th>
              {title} ({assets.length}) <br />
              <span className="source">zdroj </span>
              <a href={source} target="_BLANK">NRSR <i className="fa fa-external-link" aria-hidden="true" /></a>
              <span className="source">{(year !== 0 ? `rok ${year}` : '')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset, key) => (
            <tr key={key}>
              <td className="key">{key < 9 ? `0${key + 1}` : (key + 1)}</td>
              <td>
                {asset}
              </td>
            </tr>
          )
          )}
        </tbody>
        {this.state.isImageOnServer && <tfoot><tr><td colSpan="2"><img className="assets-declaration plot" alt="majetok" src={image} /></td></tr></tfoot>}
      </table>
    )
  }
}

export default DetailAssetDeclaration
