// Formatting like it's 1998....
// javascript is not our strength. If you'd like to help or have any suggestions how to improve the code, we want to hear from you. Please contact us on facebook.

var unique = 1;

function icoUrl(ico) {
  return "http://www.finstat.sk/" + ico;
}

function openTabLink(is_map_view, url, text) {
    // TODO: remove "link" if url is empty
    return "<a href=\"" + url + "\" " + (is_map_view ? "class=\"verejne-menu-selected\"" : "") + " target=\"_blank\">" + text + "</a>";
}

function computeTrend(num, old_num) {
  if (!isNaN(num) && isFinite(num) && !isNaN(old_num) && isFinite(old_num) && old_num != 0) {
    return Math.round((num - old_num) * 100 / Math.abs(old_num));
  } else {
    return 0;
  }
}

function IsValidValue(value) {
  if (value == null || value == 'null' || value == 'NULL' || value == 'None' || value == 'nezisten') return false;
  return true;
}

function getFinancialData(data, ico) {
  var findata = { };  
  if (data.company_stats.length > 0) {
    var company_stats = data.company_stats[0];
    findata.ico = ico;
    if (IsValidValue(company_stats.datum_vzniku)) findata.zaciatok = company_stats.datum_vzniku;  
    if (IsValidValue(company_stats.datum_zaniku)) findata.koniec = company_stats.datum_zaniku;
    if (IsValidValue(company_stats.zisk2015)) findata.zisk15 = company_stats.zisk2015;
    if (IsValidValue(company_stats.trzby2015)) findata.trzby15 = company_stats.trzby2015;  
    if (IsValidValue(company_stats.zisk2014)) findata.zisk14 = company_stats.zisk2014;
    if (IsValidValue(company_stats.trzby2014)) findata.trzby14 = company_stats.trzby2014;
    if (IsValidValue(company_stats.zisk2015)) findata.zisk_trend = computeTrend(findata.zisk15, findata.zisk14); 
    if (IsValidValue(company_stats.trzby2015)) findata.trzby_trend = computeTrend(findata.trzby15, findata.trzby14);
    if (IsValidValue(company_stats.zamestnanci2015)) findata.zamestnancov = company_stats.zamestnanci2015;  
  }
  return findata;
}

function addCommas(nStr) {
    nStr += '';
    x = nStr.split('.');
    x1 = x[0];
    x2 = x.length > 1 ? ',' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + '&nbsp;' + '$2');
    }
    return x1 + x2;
}

function showNumberCurrency(num, cur) {  
  return addCommas(num) + " " + cur;
}

function showNumber(num) {  
  return showNumberCurrency(num, "€");
}

function showDate(date_string) {
  var monthNames = [
    "január", "február", "marec",
    "apríl", "máj", "jún", "júl",
    "august", "september", "október",
    "november", "december"
  ];

  var date = new Date(date_string);
  var day = date.getDate();
  var monthIndex = date.getMonth();
  var year = date.getFullYear();

  return day + '. ' + monthNames[monthIndex] + ' ' + year;
}

// For map view, we do not give red/green colors
function showTrend(trend, is_map_view) {
  var str = "(";
  if (trend >= 0) {
    str += "<span title = \"Oproti predchádzajúcemu roku\" style=\"" + (is_map_view ? "" : "color:green;") + "\">+" + trend + "%</span>";
  } else {
    str += "<span title = \"Oproti predchádzajúcemu roku\" style=\"" + (is_map_view ? "" : "color:red;") + "\">" + trend + "%</span>";
  }
  str += ")";
  return str;      
}

function displayFinancialData(findata, is_map_view) {  
  if (!enable_finstat_data || !findata.hasOwnProperty('ico')) return "";
  var ico = findata.ico;
  var findata_string = "<tr><td>";
  if (findata.hasOwnProperty('zaciatok')) {
    findata_string += "<span title = \"Vznik\"> * " + openTabLink(is_map_view, icoUrl(ico), showDate(findata.zaciatok)) + "</span>";
  } 
  if (findata.hasOwnProperty('koniec')) {
    findata_string += "<span title = \"Zánik\"> ✝ " + openTabLink(is_map_view, icoUrl(ico), showDate(findata.koniec)) + "</span>";
  } 
  if (findata.hasOwnProperty('zamestnancov')) {
    findata_string += "<span title = \"Zamestnancov\"> &#x1f464; " + openTabLink(is_map_view, icoUrl(ico), findata.zamestnancov) + "</span>";
  }
  findata_string += "</td></tr><tr><td>";

  if (findata.hasOwnProperty('zisk15')) {
    findata_string += "<span> Zisk v 2015: &nbsp;" + openTabLink(is_map_view, icoUrl(ico), showNumber(findata.zisk15)) + " </span>";
    if (findata.hasOwnProperty('zisk_trend')) {
      findata_string += "<span title=\"Trend\"> " + showTrend(findata.zisk_trend, is_map_view) + " </span>";
    }
  }
  findata_string += "</td></tr><tr><td>";
  
  if (findata.hasOwnProperty('trzby15')) {
    findata_string += "<span> Tržby v 2015: " + openTabLink(is_map_view, icoUrl(ico), showNumber(findata.trzby15)) + "</span>";
    if (findata.hasOwnProperty('trzby_trend')) {
      findata_string += "<span title=\"Trend\"> " + showTrend(findata.trzby_trend, is_map_view) + " </span>";
    }
  }

  findata_string += "</td></tr>";
  return findata_string;
}

function getRecursiveInfo(eid, unique_id, is_map_view, show_zoom_to) {  
  var resultsText;
  var req = serverURL + 'getInfo?eid=' + eid;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
      var jsonData = JSON.parse(xmlhttp.responseText);
      if (jsonData.entities != null && jsonData.entities.length > 0) {
        jsonData.entities[0].eid = eid;        
      }
      if (!show_zoom_to) {
        document.getElementById(unique_id).innerHTML = displayInfoPrepojenia(jsonData);
      } else {
        document.getElementById(unique_id).innerHTML = is_map_view ? displayInfo(jsonData) : displayInfoSearch(jsonData);
      }
    }
  }
  xmlhttp.open("GET", req, true);
  xmlhttp.send();
}

function getRecursiveInfoLink(eid, text, is_map_view, show_zoom_to) {
  unique += 1;
  var unique_id = 'unique' + unique;
  return "<div id = \"" + unique_id + "\" onclick=\"getRecursiveInfo('" + eid + "','" + unique_id + "'," + (is_map_view ? "true" : "false") + "," + (show_zoom_to ? "true" : "false") + ");" +
         "event.stopPropagation()\"><a href=\"javascript:;\"" + (is_map_view ? "class=\"verejne-menu-selected\"" : "") + ">" + text + "</a></div>";
}

// if show_zoom_to is true then use the local link and javascript to show entity on the map.
// if show_zoom_to is false we produce external link
function displayInfoInternal(data, is_map_view, enable_recursive_related, show_zoom_to) {	
  if (data == null || data.entities == null || data.entities.length == 0) return "";
  entity = data.entities[0];  
  var linkShowEntityOnMap = serverURL + "?zobraz&" + entity.lat + "&" + entity.lng + "&" + entity.eid +"&";
  basic_data =
      "<tr><td><b>" + entity.entity_name + "&nbsp;&nbsp;</b>" +
      "<a href=\"javascript:;\" onClick=\"" + (is_map_view ? "" : "$('#searchEntityModal').modal('toggle');") + "zoomToLatLng(" + entity.lat + "," + entity.lng + "," + entity.eid + ");\"" +
      " title=\"Zobraz na mape\"" + (is_map_view ? "class=\"verejne-menu-selected\"" : "") + ">" + (show_zoom_to ? "⎈" : "") + "</a> " +      
      (show_zoom_to ? "" : "<a title=\"Zobraz na mape\" target=\"_blank\" href=\"" + linkShowEntityOnMap + "\">⎈</a>") +
      "</td></tr><tr><td>" + entity.address + "</td></tr>";

  // Try to extract ico from different data sources
  var ico = null;
  if (data.new_orsr_data.length >= 1) {
    ico = data.new_orsr_data[0].ico;
  } else if (data.orsresd_data.length >= 1) {
    ico = data.orsresd_data[0].ico;
  } else if (data.firmy_data.length >= 1) {
    ico = data.firmy_data[0].ico;
  }
  // pad ico to have length 8
  if (ico != null) {
    while (ico.length < 8) ico = "0" + ico;
  }  

  basic_data += displayFinancialData(getFinancialData(data, ico), is_map_view);

  if (ico != null) {
    basic_data += "<tr><td>" +
      "IČO: " + openTabLink(is_map_view,
              "http://www.orsr.sk/hladaj_ico.asp?ICO=" + ico + "&SID=0",
              ico) +
      " (" + openTabLink(is_map_view, icoUrl(ico), "detaily o firme") + ")" +
      "</td></tr>";
    if (data.total_contracts != null && data.total_contracts > 0) {
      basic_data += "<tr><td>Verejné zákazky: " + openTabLink(is_map_view,
          "http://www.otvorenezmluvy.sk/documents/search?utf8=%E2%9C%93&q=" + entity.entity_name,
          showNumber(data.total_contracts)) + "</td></tr>";
    }
  }

  if (data.zrsr_data.length >= 1) {
    zrsr_data = data.zrsr_data[0];
    basic_data += "<tr><td>" +
      "IČO Živnostníka: " + openTabLink(is_map_view, "zrsr.html?" + zrsr_data.ico, zrsr_data.ico) +
      "</td></tr>";
  }

  if (data.advokati_data.length >= 1) {
    basic_data += "<tr><td>" + openTabLink(is_map_view, 'http://datanest.fair-play.sk/searches/quick?query_string=' + entity.entity_name, 'Advokát') + "</td></tr>";
  }

  if (data.nadacie_data.length >= 1) {
    basic_data += "<tr><td>" + openTabLink(is_map_view, 'http://datanest.fair-play.sk/searches/quick?query_string=' + entity.entity_name, 'Nadácia') + "</td></tr>";
  }

  if (data.auditori_data.length >= 1) {
    basic_data += "<tr><td>" + openTabLink(is_map_view, 'http://datanest.fair-play.sk/searches/quick?query_string=' + entity.entity_name, 'Auditor') + "</td></tr>";
  }

  if (data.sponzori_stran_data.length >= 1) {
    sponzor_block = "<tr><td>Sponzor strany:<ul>";
    for (i = 0; i < data.sponzori_stran_data.length; i++) {
      sponzor = data.sponzori_stran_data[i];
      sponzor_block += "<li>" + openTabLink(is_map_view, 'http://datanest.fair-play.sk/searches/quick?query_string=' + entity.entity_name, sponzor.strana + ", " +
          showNumberCurrency(sponzor.hodnota_daru, (sponzor.rok < 2009 ? "Sk" : "€")) +
          " (rok " + sponzor.rok + ")") + "</li>";
    }
    sponzor_block += "</ul></td></tr>";
    basic_data += sponzor_block;
  }

  if (data.stranicke_prispevky_data.length >= 1) {
    sponzor_block = "<tr><td>Stranícke príspevky:<ul>";
    for (i = 0; i < data.stranicke_prispevky_data.length; i++) {
      sponzor = data.stranicke_prispevky_data[i];
      sponzor_block += "<li>" + openTabLink(is_map_view, 'http://datanest.fair-play.sk/searches/quick?query_string=' + entity.entity_name, sponzor.strana + ", " +
          showNumberCurrency(sponzor.vyska_prispevku, sponzor.mena) +
          " (rok " + sponzor.rok + ")") + "</li>";
    }
    sponzor_block += "</ul></td></tr>";
    basic_data += sponzor_block;
  }
  
  if (data.uzivatelia_vyhody_ludia_data.length >= 1) {
    is_funkcionar = false;
    for (i = 0; i < data.uzivatelia_vyhody_ludia_data.length; i++) {
      funkcionar = data.uzivatelia_vyhody_ludia_data[i];
      if (funkcionar.is_funkcionar == "1") {
        is_funkcionar = true;
        break;
      }
    }
    if (is_funkcionar) {
      basic_data += "<tr><td>" + openTabLink(is_map_view, 
              "http://www.transparency.sk/sk/zverejnujeme-zoznam-vlastnikov-firiem/",
              "Verejný funkcionár") + "</td></tr>";
    }
  }

  if (data.related.length >= 1) {
    related_block = "<tr><td>Vzťahy:<ul>";

    for (i = 0; i < data.related.length; i++) {
      related_block += "<li>" + (enable_recursive_related ? getRecursiveInfoLink(data.related[i].eid, data.related[i].name, is_map_view, show_zoom_to) : data.related[i].name) + "</li>";  
    }

    related_block += "</ul></td></tr>";
    basic_data += related_block;
  }
 
  if (data.contracts.length >= 1) {
      contracts_block = "<tr><td>Zmluvy:<ul>";
      for (i = 0; i < data.contracts.length; i++) {
          contract = data.contracts[i];
          contracts_block += "<li>" + openTabLink(is_map_view, 
                  contract.source, contract.customer + ", " + showNumber(contract.total)) +
              "</li>";
      }
      contracts_block += "</ul></td></tr>";
      basic_data += contracts_block;
  }

  return "<table>" + basic_data + "</table>";
}

function displayInfo(data) {
  return displayInfoInternal(data, true, true, true);
}  

function displayInfoSearch(data) {
  return displayInfoInternal(data, false, true, true);
}

function displayInfoPrepojenia(data, eid) {
  if (data.entities.length > 0) {
    data.entities[0].eid = eid;    
  }
  return displayInfoInternal(data, false, true, false); 
}

// Moves the map so that it's centered above the given coordinates.
function zoomToLatLng(lat, lng, eid) {  
  server_calls_enabled = false;
  var zoom = global_map.getZoom();
  if (zoom < kZoomForEntity) {
    zoom = kZoomForEntity + 2;
  }
  global_map.setZoom(zoom);
  global_map.panTo(new google.maps.LatLng(lat, lng));
  server_calls_enabled = true;  
  getEntitiesInternal(global_map, eid);
}
