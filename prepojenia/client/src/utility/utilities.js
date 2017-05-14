function addCommas(nStr) {
  const x = `${nStr}`.split('.');
  let x1 = x[0];
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(x1)) {
    x1 = x1.replace(rgx, '$1 $2');
  }
  return x1;
}

export function showNumberCurrency(num, cur = '€') {
  return `${addCommas(num)} ${cur}`;
}

export function icoUrl(ico) {
  return `http://www.finstat.sk/${ico}`;
}

function computeTrend(num, oldNum) {
  if (!isNaN(num) && isFinite(num) && !isNaN(oldNum) && isFinite(oldNum) && oldNum !== 0) {
    return Math.round(((num - oldNum) * 100) / Math.abs(oldNum));
  }
  return 0;
}

function isValidValue(value) {
  return !(value == null || value === 'null' || value === 'NULL' || value === 'None' || value === 'nezisten');
}

export function isPolitician(entity) {
  return entity.sponzori_stran_data.length >= 1 || entity.stranicke_prispevky_data.length >= 1;
}

export function getFinancialData(data, ico) {
  const findata = { };
  if (data.company_stats.length > 0) {
    const companyStats = data.company_stats[0];
    findata.ico = ico;
    if (isValidValue(companyStats.datum_vzniku)) findata.zaciatok = companyStats.datum_vzniku;
    if (isValidValue(companyStats.datum_zaniku)) findata.koniec = companyStats.datum_zaniku;
    if (isValidValue(companyStats.zisk2015)) findata.zisk15 = companyStats.zisk2015;
    if (isValidValue(companyStats.trzby2015)) findata.trzby15 = companyStats.trzby2015;
    if (isValidValue(companyStats.zisk2014)) findata.zisk14 = companyStats.zisk2014;
    if (isValidValue(companyStats.trzby2014)) findata.trzby14 = companyStats.trzby2014;
    if (isValidValue(companyStats.zisk2015)) {
      findata.zisk_trend = computeTrend(findata.zisk15, findata.zisk14);
    }
    if (isValidValue(companyStats.trzby2015)) {
      findata.trzby_trend = computeTrend(findata.trzby15, findata.trzby14);
    }
    if (isValidValue(companyStats.zamestnanci2015)) {
      findata.zamestnancov = companyStats.zamestnanci2015;
    }
  }
  return findata;
}

export function showDate(dateString) {
  const monthNames = [
    'január', 'február', 'marec',
    'apríl', 'máj', 'jún', 'júl',
    'august', 'september', 'október',
    'november', 'december',
  ];

  const date = new Date(dateString);
  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear();

  return `${day}.${monthNames[monthIndex]} ${year}`;
}

export function extractIco(data) {
  let ico = null;
  if (data.new_orsr_data.length >= 1) {
    ico = data.new_orsr_data[0].ico;
  } else if (data.orsresd_data.length >= 1) {
    ico = data.orsresd_data[0].ico;
  } else if (data.firmy_data.length >= 1) {
    ico = data.firmy_data[0].ico;
  }
  // pad ico to have length 8
  if (ico != null) {
    while (ico.length < 8) ico = `0${ico}`;
  }
  return ico;
}
