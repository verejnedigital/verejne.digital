import React from 'react';
import StranickePrispevky from './StranickePrispevky';
import SponzorstvoStran from './SponzorstvoStran';
import Vztahy from './Vztahy';
import Zmluvy from './Zmluvy';
import FinancialData from './FinancialData';
import TabLink from './TabLink';
import { getFinancialData, extractIco, icoUrl, showNumberCurrency } from '../../utility/utilities';


const Info = ({ data, eid }) => {
  const entity = data.entities[0];
  const findata = getFinancialData(data, extractIco(data));
  return (
    <a className="list-group-item list-group-item-info" style={{ borderColor: 'black' }}>
      <table>
        <tbody>
          <tr>
            <td>
              <b>{entity.entity_name}&nbsp;</b>
              <a title="Zobraz na mape" target="_blank" rel="noopener noreferrer" href={`?zobraz&${entity.lat}&${entity.lng}&${eid}&`}>⎈</a>
            </td>
          </tr>
          <tr>
            <td>
              {entity.address}
            </td>
          </tr>
          {findata.ico &&
            <tr>
              <td>
                <FinancialData findata={findata} />
              </td>
            </tr>
          }
          {findata.ico &&
            <tr>
              <td>IČO:&nbsp;
                <TabLink
                  isMapView={false}
                  url={`http://www.orsr.sk/hladaj_ico.asp?ICO=${findata.ico}&SID=0`}
                  text={findata.ico}
                />
                &nbsp;(
                  <TabLink
                    isMapView={false}
                    url={icoUrl(findata.ico)}
                    text={'detaily o firme'}
                  />
                )
              </td>
            </tr>
          }
          {data.total_contracts !== null && data.total_contracts > 0 &&
            <tr>
              <td>
                Verejné zákazky:&nbsp;
                <TabLink
                  isMapView={false}
                  url={`http://www.otvorenezmluvy.sk/documents/search?utf8=%E2%9C%93&q=${entity.entity_name}`}
                  text={showNumberCurrency(data.total_contracts)}
                />
              </td>
            </tr>
          }
          {data.zrsr_data.length >= 1 &&
            <tr>
              <td>
                IČO Živnostníka:&nbsp;
                <TabLink
                  isMapView={false}
                  url={`zrsr.html?${data.zrsr_data[0].ico}`}
                  text={data.zrsr_data[0].ico}
                />
              </td>
            </tr>
          }
          {data.advokati_data.length >= 1 &&
            <tr>
              <td>
                <TabLink
                  isMapView={false}
                  url={`http://datanest.fair-play.sk/searches/quick?query_string=${entity.entity_name}`}
                  text={'Advokát'}
                />
              </td>
            </tr>
          }
          {data.nadacie_data.length >= 1 &&
            <tr>
              <td>
                <TabLink
                  isMapView={false}
                  url={`http://datanest.fair-play.sk/searches/quick?query_string=${entity.entity_name}`}
                  text={'Nadácia'}
                />
              </td>
            </tr>
          }
          {data.auditori_data.length >= 1 &&
            <tr>
              <td>
                <TabLink
                  isMapView={false}
                  url={`http://datanest.fair-play.sk/searches/quick?query_string=${entity.entity_name}`}
                  text={'Auditor'}
                />
              </td>
            </tr>
          }
          {data.sponzori_stran_data.length >= 1 &&
            <tr>
              <td>Stranícke príspevky:
                <SponzorstvoStran
                  entityName={entity.entity_name}
                  data={data.sponzori_stran_data}
                />
              </td>
            </tr>
          }
          {data.stranicke_prispevky_data.length >= 1 &&
            <tr>
              <td>Stranícke príspevky:
                <StranickePrispevky
                  entityName={entity.entity_name}
                  data={data.stranicke_prispevky_data}
                />
              </td>
            </tr>
          }
          {data.uzivatelia_vyhody_ludia_data.find(funkcionar => funkcionar.is_funkcionar === '1') &&
            <tr>
              <td>
                <TabLink
                  isMapView={false}
                  url={'http://www.transparency.sk/sk/zverejnujeme-zoznam-vlastnikov-firiem/'}
                  text={'Verejný funkcionár'}
                />
              </td>
            </tr>
          }
          {data.related.length >= 1 &&
            <tr>
              <td>Vzťahy:
                <Vztahy
                  data={data.related}
                />
              </td>
            </tr>
          }
          {data.contracts.length >= 1 &&
            <tr>
              <td>Zmluvy:
                <Zmluvy
                  data={data.contracts}
                  isMapView={false}
                />
              </td>
            </tr>
          }
        </tbody>
      </table>
    </a>
  );
};

export default Info;
