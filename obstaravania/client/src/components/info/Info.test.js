import React from 'react';
import renderer from 'react-test-renderer';
import Info from './Info';

it('renders dummy as before', () => {
  const dummy = {"zrsr_data":[],"company_stats":[],"contracts":[],"new_orsr_data":[],"sponzori_stran_data":[],"related":[{"name":"Dummy, a.s.","eid":123,"address":"Dummy street 123, Bratislava","lat":123,"lng":123,"ds":[null,0.123,1,0],"size":1}],"auditori_data":[],"audiovizfond_data":[],"entities":[{"lat":"123","lng":"123","entity_name":"Dummy","address":"Dummy Street 123, 851 04 Petržalka, Slovakia"}],"firmy_data":[],"total_contracts":0,"advokati_data":[],"nadacie_data":[],"orsresd_data":[],"stranicke_prispevky_data":[{"strana":"Dummy","rok":"2010","mena":"EUR","vyska_prispevku":"123"}],"uzivatelia_vyhody_ludia_data":[]}; // eslint-disable-line
  const component = renderer.create(<Info data={dummy} />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
