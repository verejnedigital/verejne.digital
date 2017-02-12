import React from 'react';
import TabLink from './TabLink';
import ShowTrend from './ShowTrend';
import { icoUrl, showDate, showNumber } from '../../utility/utilities';

const FinancialData = ({ findata }) => (
  <table>
    <tbody>
      <tr>
        <td>
          {findata.zaciatok &&
            <span title="Vznik"> *&nbsp;
              <TabLink
                isMapView={false}
                url={icoUrl(findata.ico)}
                text={showDate(findata.zaciatok)}
              />
            </span>
          }
          {findata.koniec &&
            <span title="Zánik"> ✝&nbsp;
              <TabLink
                isMapView={false}
                url={icoUrl(findata.ico)}
                text={showDate(findata.koniec)}
              />
            </span>
          }
          {findata.zamestnancov &&
            <span title="Zamestnancov"> &#x1f464;
              <TabLink
                isMapView={false}
                url={icoUrl(findata.ico)}
                text={findata.zamestnancov}
              />
            </span>
          }
        </td>
      </tr>
      <tr>
        <td>
          {findata.zisk15 &&
            <span> Zisk v 2015:&nbsp;
              <TabLink
                isMapView={false}
                url={icoUrl(findata.ico)}
                text={showNumber(findata.zisk15)}
              />
            </span>
          }
          {findata.zisk_trend &&
            <span title="Trend">
              &nbsp;(<ShowTrend trend={findata.zisk_trend} isMapView={false} />)
            </span>
          }
        </td>
      </tr>
      <tr>
        <td>
          {findata.trzby15 &&
          <span> Tržby v 2015:&nbsp;
            <TabLink
              isMapView={false}
              url={icoUrl(findata.ico)}
              text={showNumber(findata.trzby15)}
            />
          </span>
          }
          {findata.trzby_trend &&
            <span title="Trend">
              &nbsp;(<ShowTrend trend={findata.trzby_trend} isMapView={false} />)
            </span>
          }
        </td>
      </tr>
    </tbody>
  </table>
);


export default FinancialData;
