// javascript is not our strength. If you'd like to help or have any suggestions how to improve the code, we want to hear from you. Please contact us on facebook.
// Global variables capturing the state.
var entities = [];
var markers = [];
var related = {};
// contains id for given eid.
var reverse = {};
// this maps lines for object i.
var all_lines = {};
// make server calls only when this is true
var server_calls_enabled = true;

var global_map;
// used to put recently selected items to the top of the list
var global_select_order = 1;

// When we open a new one, we always close the last one.
var last_opened_info_window = null;
var last_opened_info_window_data = null;

// this should be used only after computeListOfSelectedOrRelatedEntities()
var listOfSelectedOrRelatedEntities = [];

// contains params from url
var searchString;

// Global constants
// Level 0 = entities
// Level 1 = subcities
// Level 2 = cities
// Level 3 = districts
kZoomForEntity = 16;
kZoomForSubCity = 13;
kZoomForCity = 10;

// Entity which is a number is individual.
// District starts with letter
function isIndividual(eid) {
  return !isNaN(parseFloat(eid)) && isFinite(eid);
}
  
function Entity(eid, lat, lng, title, size, ds, level) {
  this.eid = eid;
  this.lng = lng;
  this.lat = lat;
  this.selected = false;
  this.related = false;
  this.title = title;
  this.size = size;
  this.level = level;
  this.visible = false;
  this.ds = ds;
}

// This is to get the entity which is copied by value
function EntityCopy(entity) {
  var copy_entity= {};
  copy_entity.eid = entity.eid;
  copy_entity.lat = entity.lat;
  copy_entity.lng = entity.lng;
  copy_entity.selected = entity.selected;
  copy_entity.related = entity.related;
  copy_entity.title = entity.title;
  copy_entity.size = entity.size;
  copy_entity.level = entity.level;
  copy_entity.visible = entity.visible;
  copy_entity.ds = entity.ds.slice();
  return copy_entity;
}
// This function returns Entity which is summary of all entities at the position of the Marker i
// It is supposed to be "maximum". See implementation below
function entityForMarker(i) {
  if (markers[i].xx_eid == null || markers[i].xx_eid.length <= 1) {
    // fast path
    return entities[i];
  } else {
    //consolidate all entities
    var summary = EntityCopy(entities[reverse[markers[i].xx_eid[0]]]);
    for (j = 1; j < markers[i].xx_eid.length; j++) {
      entity = entities[reverse[markers[i].xx_eid[j]]];
      // Merge to summary
      summary.selected = summary.selected || entity.selected;
      summary.related = summary.related || entity.related;
      summary.visible = summary.visible || entity.visible;
      // merge datasource values
      if (summary.ds != null && entity.ds != null && summary.ds.length == 4 && entity.ds.length == 4) {
        for (k = 0; k < 4; k++) {
          summary.ds[k] = Math.max(summary.ds[k], entity.ds[k]);
        }
      }
    }
    return summary;
  }
}

function shouldBeVisible(id, map) {
  var entLatLng = new google.maps.LatLng(parseFloat(entities[id].lat),parseFloat(entities[id].lng));
  return ((entities[id].level == getLevel(map) && map.getBounds().contains(entLatLng)) || 
          (entities[id].selected == true) || 
          (entities[id].related == true));
}

function getLevel(map) {
  var level = 3;
  if (map.getZoom() == null || map.getZoom() == undefined) return level;
  if (map.getZoom() >= kZoomForEntity) {
    level = 0;
  } else if (map.getZoom() >= kZoomForSubCity) {
    level = 1;
  } else if (map.getZoom() >= kZoomForCity) {
    level = 2;
  }
  return level;
}

function maybeSelect(eid) {
  if (reverse.hasOwnProperty(eid)) {
    console.log('Zooming and selecting entity ' + eid);
    // ak uz mame danu entitu
    var id = reverse[eid];
    if (!entities[id].selected) {
      selectMarker(id);
      getInfo(id);    
    }
  } else {
    console.log('Error zooming and selecting entity ' + eid);    
  }
}

// If we receive response to other than the last request we ignore it.
var last_get_entities_request = "";

function getEntitiesInternal(map, f_eid) {
  // Determine request url
  var req = serverURL + 'getEntities';
  var bounds = map.getBounds();
  var lat1 = '47.26036122625137';
  var lng1 = '16.53369140625';
  var lat2 = '49.90503005077024';
  var lng2 = '22.46630859375';
  console.log('Zoom level:' + map.getZoom());
  var restrictToSlovakia = true;
  if (bounds != null && bounds != undefined) {
    lat1 = bounds.getSouthWest().lat();
    lng1 = bounds.getSouthWest().lng();
    lat2 = bounds.getNorthEast().lat();
    lng2 = bounds.getNorthEast().lng();
    restrictToSlovakia = false;
  }
  var level = getLevel(map);
  req += '?level=' + level + '&lat1=' + lat1 + '&lng1=' + lng1 + '&lat2=' + lat2 + '&lng2=' +lng2 + (restrictToSlovakia ? '&restrictToSlovakia=true': '');  

  var xmlhttp = new XMLHttpRequest();  

  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          if (req != last_get_entities_request) {
            console.log('Ignoring request ' + req + ' because new request was sent in the meantime.');
            return;
          }
          var myArr = JSON.parse(xmlhttp.responseText);
          freshListOfEntities(myArr, map);          
          // This is optional selecting of entity.
          if (f_eid >= 0) {            
            maybeSelect(f_eid);
          }          
          
          // Optionally zoom to concrete entity from the url          
          params = searchString.split("&");                
          if (params.length >= 4) {
              param1 = unescape(params[0]); 
              param2 = unescape(params[1]); // latitude               
              param3 = unescape(params[2]); // longitude
              param4 = unescape(params[3]); // eid
              if (param1 == "zobraz") {
                searchString = "";                
                zoomToLatLng(param2, param3, param4);
              }
          }
      }
  }
  xmlhttp.open("GET", req, true);
  xmlhttp.send();
  last_get_entities_request = req;
  console.log('getEntities request: ' + req);
}

function getEntities(map) {
  getEntitiesInternal(map, -1);
}

function sortEntities(a, b) {
  if (a.selected == b.selected) {
    if (a.selected) {      
      return a.select_order > b.select_order ? -1 : 1;
    }
    if (a.related == b.related) {
      return b.size - a.size;
    } else return a.related > b.related ? -1 : 1;
  } else return a.selected > b.selected ? -1 : 1;
}

// extra_caption funugje len ak su entity na vstupe zoradene.
function getListHtml(sorted_entities, extra_caption) {
  var html = [];
  for (i = 0; i < sorted_entities.length; i++) {
    var index = reverse[sorted_entities[i].eid];
    var entity = entities[index];    
    var color = "list-group-item-info"; // green
    if (isIndividual(entity.eid)) color = "list-group-item-info"; // blue
    if (entity.selected) color = "list-group-item-danger"; // red    
    if (i > 0 && extra_caption && !entity.selected && !entity.related) {
      var prev_entity = entities[reverse[sorted_entities[i-1].eid]];
      if (prev_entity.selected || prev_entity.related) {
        html.push('<label>Firmy a ľudia v geografickom okolí:</label>');
      }
    } else if (i == 0 && extra_caption && !entity.selected && !entity.related && isIndividual(entity.eid)) {
      html.push('<label>Firmy a ľudia v geografickom okolí:</label>');
    }
    // TODO: Refactor this
    html.push(
      '<a ' + (entity.selected ? '' : 'href="#world-top"') + ' class="list-group-item ' + color + '"'
          + (entity.selected ? '' : ' onclick="selectMarker(' + index + ');getInfo(' + index + ')"') + '>'
      + (entity.selected ? '<button type="button" class="close" onmousedown="selectMarker(' + index + ');getInfo(' + index + ')"><span aria-hidden="true">&times;</span></button>' : '')
      + ((!entity.selected && isIndividual(entity.eid)) ? '<span style="color: ' + (isPolitician(entity) ? kPoliticianColor : kNormalColor) + ';font-size:18px;font-weight:bold;">' + (hasContractsWithState(entity) ? '<i class="fa fa-circle" aria-hidden="true"></i>' : '<i class="fa fa-circle-o" aria-hidden="true"></i>') + ' </span> ' : '')
      + ((!entity.selected && !isIndividual(entity.eid)) ? '<i class="fa fa-circle" aria-hidden="true"></i> &nbsp; ' : '')
      + ((entity.selected && entity.info != undefined) ? entity.info : entity.title)
      + (!isIndividual(entity.eid) && !entity.selected ? ' <span class="many">' + entity.size + '</span>' : '')
      + (isIndividual(entity.eid) && !entity.selected ? ' &nbsp;<span class="manygray"><i class="fa fa-chevron-right sizeCellArrow" aria-hidden="true"></i></span>' : '')
      + '</a>');
  }
  return html;
}

function updateInfoWindow(redraw) {  
  if (last_opened_info_window == null) return;
  console.log('updateInfoWindow ' + last_opened_info_window_data.length);
  var ents = [];
  for (i = 0; i < last_opened_info_window_data.length; i++) {    
    ents.push(entities[reverse[last_opened_info_window_data[i]]]);
  }
  last_opened_info_window.setContent('<div id="content">' + getListHtml(ents, false).join('') + '</div>');  
  if (redraw) {
    console.log('redraw infoWindow');
    last_opened_info_window.close();
    last_opened_info_window.open();
  }
}

function updateInfoList() {
  var sorted_entities = [];
  for (i = 0; i < entities.length; i++) {
    if (entities[i].visible) {
      sorted_entities.push(entities[i]);
    }
  }
  sorted_entities.sort(sortEntities);
  document.getElementById("info_list").innerHTML = getListHtml(sorted_entities, true).join('');
}

function freshListOfEntities(arr, map) {
  console.log('Received ' + arr.length + ' entities');
  var old_count = entities.length;
  var added = 0;
  var used_level = getLevel(map);
  for (i = 0; i < arr.length; i++) {
    // If we already have that entity then skip adding it.
    if (reverse.hasOwnProperty(arr[i].eid)) { 
      continue;
    }    
    entity = new Entity(arr[i].eid, arr[i].lat, arr[i].lng, arr[i].name, arr[i].size, arr[i].ds, used_level);
    // TODO: this is bit hacky, you might wanna fix this. ;)
    if ('lat1' in arr[i]) {
      entity.lat1 = arr[i].lat1
      entity.lat2 = arr[i].lat2
      entity.lng1 = arr[i].lng1
      entity.lng2 = arr[i].lng2
    }
    entities.push(entity);
    reverse[arr[i].eid] = old_count + added;
    added++;
  }
  console.log('# Entities added: ' + added);
  generateMarkers(map, old_count);
  updateInfoList();
}

function drawMarker(i, map) {
  if (!entities[i].visible) return;
  markers[i].icon = getIcon(entityForMarker(i));
  markers[i].setMap(map);
}

function selectMarker(i) {
  var map = global_map;
  if (entities[i].selected) {
    entities[i].selected = false;
    removeLines(i, map);
    for (j = 0; j < related[i].length; j++) {
      // TODO: This is incorrect if that entity was related to more selected entities.
      entities[related[i][j]].related = false;
    }
    related[i] = [];
  } else if (isIndividual(entities[i].eid)) {
    console.log('Entity selected.');
    entities[i].selected = true;
    entities[i].select_order = global_select_order;
    global_select_order += 1;
    console.log('Global select order: ' + global_select_order + ' : ' + entities[i].select_order);
    getRelated(i, map);
  } else {
    console.log('Clicked on group item. Zooming there!');
    console.log('box: ' + entities[i].lat1 + ', ' + entities[i].lng1 + ',' +  entities[i].lat2 + ', ' + entities[i].lng2);
  
    server_calls_enabled = false; 
    if (entities[i].level == 1) {
      map.setOptions({ maxZoom: 17 });
      bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(entities[i].lat, entities[i].lng));
      map.fitBounds(bounds);
      //map.panTo({ lat: entities[i].lat, lng: entities[i].lng});
      map.setOptions({ maxZoom: null} );
    } else {
      // pan to and zoom
      bounds = new google.maps.LatLngBounds();
      bounds.extend(new google.maps.LatLng(entities[i].lat1, entities[i].lng1));
      bounds.extend(new google.maps.LatLng(entities[i].lat2, entities[i].lng2));
      map.setOptions({ minZoom: map.getZoom() + 2});
      map.fitBounds(bounds);
      map.setOptions({ minZoom: null });
      //map.panTo({ lat: entities[i].lat, lng: entities[i].lng});
      //var zoom = 16;
      //if (entities[i].level == 3) zoom = kZoomForCity;
      //else if (entities[i].level == 2) zoom = kZoomForSubCity;
      //map.setZoom(zoom);
    }
    server_calls_enabled = true;
    getEntities(map);
  }
  drawMarker(i, map);
}


function project(position, Map) {
    var scale = Math.pow(2, Map.getZoom());
    var proj = Map.getProjection();
    var bounds = Map.getBounds();

    var nw = proj.fromLatLngToPoint(
        new google.maps.LatLng( bounds.getNorthEast().lat(),
          bounds.getSouthWest().lng()));
    var point = proj.fromLatLngToPoint(position);

    return new google.maps.Point(
        Math.floor((point.x - nw.x) * scale),
        Math.floor((point.y - nw.y) * scale));
}

function getMarkerScale(entity) {
  if (!entity.hasOwnProperty("lat1")) {    
    if (global_map.getZoom() <= kZoomForEntity + 1) {
      return 4;
    }
    return 5;
  }
  if (global_map.getZoom() < kZoomForCity) {
    return Math.sqrt(entity.size) / 12 + 5;
  }
  var point1 = project(new google.maps.LatLng(entity.lat1, entity.lng1), global_map); 
  var point2 = project(new google.maps.LatLng(entity.lat2, entity.lng2), global_map); 
  return Math.min(Math.sqrt(entity.size) + 5,
                  Math.max(point2.x - point1.x, point2.y - point1.y) / 2.0 + 3.0); 
}

function isDatasourceORSR(entity) {
  return (entity.ds != null && entity.ds.length >= 3 && entity.ds[2] == 1);
}

function isDatasourceZRSR(entity) {
  return (entity.ds != null && entity.ds.length >= 4 && entity.ds[3] == 1);
}

function isPolitician(entity) {
  return (entity.ds != null && entity.ds.length >= 1 && entity.ds[0] == 1);
}

// return value in (0.25, 1.0)
function contractsWithState(entity) {
  value = 0.15;
  if (entity.ds != null && entity.ds.length >= 2 && isIndividual(entity.eid)) {
    value = Math.max(value, entity.ds[1]);
  }
  value = Math.min(value, 1.0);
  return (value - 0.15) * (0.75 / 0.85) + 0.25;
}

function hasContractsWithState(entity) {
  if (entity.ds != null && entity.ds.length >= 2 && isIndividual(entity.eid)) {
    if (entity.ds[1] > 0) return true;
  }
  return false;
}

function getColorForEntity(entity) {
  if (entity.selected) return "yellow";
  if (isIndividual(entity.eid)) {
    if (hasContractsWithState(entity)) {
      if (isPolitician(entity)) {
        return kPoliticianColor;
      } else {
        return kNormalColor;  
      }
    } else {
      return "white";
    }
  }
  else return kNormalColor;
}

function getOpacityForEntity(entity) {
  if (isIndividual(entity.eid)) {
    return 1.0; 
    //return contractsWithState(entity);
  } else {
    return 0.75;
  }
}

function getStrokeColorForEntity(entity) {
  if (isIndividual(entity.eid)) {
    if (isPolitician(entity)) return kPoliticianColor;
    else return kNormalColor;
  } 
  return kNormalColor;
}

function getStrokeWeightForEntity(entity) {
  if (isIndividual(entity.eid)) {    
    if (entity.selected) return 3.0;
    return 2.0;
  }
  return 0;
}

function getIcon(entity) {
  var iconScale = getMarkerScale(entity);

  return {
    path : google.maps.SymbolPath.CIRCLE,
    scale : iconScale,
    strokeColor : getStrokeColorForEntity(entity),
    strokeWeight : getStrokeWeightForEntity(entity),
    fillColor : getColorForEntity(entity),
    fillOpacity : getOpacityForEntity(entity),
  }
}

function DoesMarkerExist(i) {
  if (i > 0 && (entities[i].lat == entities[i-1].lat && entities[i].lng == entities[i-1].lng)) {
    return i - 1;
  }
  for (j = 0; j < listOfSelectedOrRelatedEntities.length; j++) {
    if (entities[listOfSelectedOrRelatedEntities[j]].lng == entities[i].lng &&
        entities[listOfSelectedOrRelatedEntities[j]].lat == entities[i].lat) {
      return listOfSelectedOrRelatedEntities[j];
    }
  }
  return -1;
}

function addMarker(i, map) {
  var entity = entities[i];

  var new_marker;
  does_marker_exist = DoesMarkerExist(i);
  // Add only one marker per address
  if (does_marker_exist >= 0 && markers[does_marker_exist] != null) {
    new_marker = markers[does_marker_exist];
    new_marker.title += "\n" + entity.title;
    new_marker.xx_eid.push(entity.eid);
  } else {
    new_marker = new google.maps.Marker({ 
      position : { lat: entity.lat, lng: entity.lng},
      map : map,
      title : entity.title,
      id : i,
      icon: getIcon(entity),
      zIndex: -entity.size
    });
    new_marker.xx_eid = [];
    new_marker.xx_eid.push(entity.eid);    
    var infoWindow = new google.maps.InfoWindow({
      content: ''
    });
    
    new_marker.addListener('click', function() {
          if (this.xx_eid.length == 1) {
            selectMarker(this.id, map);          
            getInfo(this.id);
            console.log('Clicked on: ' + this.title);
          } else {
            if (last_opened_info_window != null) last_opened_info_window.close();
            last_opened_info_window = infoWindow;            
            last_opened_info_window_data = [];
            for (i = 0; i < this.xx_eid.length; i++) last_opened_info_window_data.push(this.xx_eid[i]);            
            updateInfoWindow(false);                          
            infoWindow.open(map, this);                    
          }
        }); 
  }

  if (i >= markers.length) {
    markers.push(new_marker);
  } else {
    markers[i] = new_marker;
  }
  // cannot be optimized away!! GetIcon might be different when we call it now
  drawMarker(i, map);
}

function deleteMarker(i) {
  if (markers[i] != null) {
    markers[i].setMap(null);
  }
  // TODO: consider keeping them, and only not drawing them.
  markers[i] = null;
}

function computeListOfSelectedOrRelatedEntities(upper_bound) {
  listOfSelectedOrRelatedEntities = [];
  for (i = 0; i < entities.length && i < upper_bound; i++) {
    if (entities[i].related == true || entities[i].selected == true) {
      listOfSelectedOrRelatedEntities.push(i);
      console.log("Adding selected or related: " + i + " " + (entities[i].related) + (entities[i].selected));
    }    
  }
}

// start_from is where the new were added
function generateMarkers(map, start_from) {
  console.log('GenerateMarkers from ' + start_from + ' to ' + entities.length);
  // the following list is used by AddMarker
  computeListOfSelectedOrRelatedEntities(start_from);
  var count_deleted = 0;
  var to_delete = []
  for (i = 0; i < entities.length; i++) {
      // Add new marker for new points + old that should be visible, but were hidden.
      if (entities[i].visible == false && (i >= start_from || shouldBeVisible(i, map))) {
        entities[i].visible = true;
        addMarker(i, map);        
      } else {
        // Remove markers for entities visible before, which should not be visible anymore.
        if (!shouldBeVisible(i, map) && (entities[i].visible == true)) {
          entities[i].visible = false;
          to_delete.push(i);
          //deleteMarker(i);
          count_deleted++;
        } else if (i < start_from && entities[i].visible) {
          // Update sizes for the ones still visible   
          var new_scale = getMarkerScale(entities[i]);          
          if ((markers[i] != null) && (markers[i].icon.scale != new_scale)) {
            markers[i].icon.scale = new_scale;
            markers[i].setMap(null);
            markers[i].setMap(map);
          }
        }
      }
  }
  for (i = 0; i < to_delete.length; i++) deleteMarker(to_delete[i]);
  console.log('# Deleted markers: ' + count_deleted);
}

function getRelated(id, map) {
  var req = serverURL + 'getRelated?eid=' + entities[id].eid;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var myArr = JSON.parse(xmlhttp.responseText);
          // Add possibly missing entities
          freshListOfEntities(myArr, map);
          // Add relations
          freshRelated(id, myArr, map);
      }
  }
  xmlhttp.open("GET", req, true);
  xmlhttp.send();
  console.log('getRelated request: ' + req);
}

function getInfo(id) {
  var req = serverURL + 'getInfo?eid=' + entities[id].eid;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
      if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
          var jsonData = JSON.parse(xmlhttp.responseText);          
          if (jsonData.entities != null && jsonData.entities.length > 0) {
            jsonData.entities[0].eid = entities[id].eid;          
          }
          entities[id].info = displayInfo(jsonData);
          updateInfoList();          
      }
  }
  xmlhttp.open("GET", req, true);
  xmlhttp.send();
  console.log('getInfo request: ' + req);
  if (last_opened_info_window != null) last_opened_info_window.close();
}

function freshRelated(id, arr, map) {
  if (arr == undefined || arr.length == undefined) {
    console.log('No related in response');
    return;
  }
  console.log('Related results: ' + arr.length);
  var related_list = [];
  for (i = 0; i < arr.length; i++) {
    related_list.push(reverse[arr[i].eid]);
    entities[reverse[arr[i].eid]].related = true;
    console.log("!" + arr[i].eid + '#' + related_list[i] + '@');
  }
  related[id] = related_list;
  drawLines(id, map);
}

function drawLine(i, j, map) {
  if (i > entities.length || j > entities.length) {
    console.log("Line cannot be drawn.");
    return;
  }
  var lineSymbol = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 5,      
      strokeWeight : 0
  };
  console.log('draw ' + i + '->' + j);
  // Create the polyline and add the symbol to it via the 'icons' property.
  var line = new google.maps.Polyline({
    path: [ { lat : entities[i].lat, lng : entities[i].lng}, { lat : entities[j].lat, lng : entities[j].lng}],
    icons: [{
      icon: lineSymbol,
      offset: '100%'
    }],
    strokeWeight : 1,
    map: map,
    strokeColor: '#0062db'
  });
  if (!all_lines.hasOwnProperty(i)) {
    all_lines[i] = [];
  }
  all_lines[i].push(line);
}

function drawLines(i, map) {
  for (j = 0; j < related[i].length; j++) {
    drawLine(i, related[i][j], map);
  }
}

function removeLines(i, map) {
  if (all_lines[i] == undefined) return;
  for (j = 0; j < all_lines[i].length; j++) {
    all_lines[i][j].setMap(null);
  }
}

function initMap() {
  var styledMapType = new google.maps.StyledMapType(
      [
        {elementType: 'geometry.fill', stylers: [{color: '#f1f4f5'}]},  
        {elementType: 'geometry.stroke', stylers: [{color: '#cddae3'}]},  
        {elementType: 'labels.text.fill', stylers: [{color: '#666666'}]}, 
        {elementType: 'labels.text.stroke', stylers: [{color: '#ffffff'}]},
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [{color: '#333333'}]
        },
        {
          featureType: 'landscape',
          elementType: 'geometry.stroke',
          stylers: [{color: '#859fb4'}]
        },
        {
          featureType: 'landscape.natural',
          elementType: 'geometry',
          stylers: [{color: '#f1f4f5'}]
        },
        {
          featureType: 'landscape.man_made',
          elementType: 'geometry.fill',
          stylers: [{color: '#dae3ea' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.fill',
          stylers: [{color: '#ffffff'}]
        }, 
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{color: '#a5baca'}]
        },
        {
          featureType: 'road.local',
          elementType: 'geometry.fill',
          stylers: [{color: '#ffffff'}]
        }, 
        {
          featureType: 'transit.line',
          elementType: 'geometry',
          stylers: [{color: '#c5d1da'}]
        },
        {
          featureType: 'transit.station',
          elementType: 'geometry',
          stylers: [{color: '#e6ecf1'}]
        },
        {
          featureType: 'water',
          elementType: 'geometry.fill',
          stylers: [{color: '#ebf8ff'}]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{color: '#859fb4'}]
        },
        {
          featureType: 'landscape.natural',
          elementType: 'labels',
          stylers: [{visibility: 'off' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels',
          stylers: [{visibility: 'off' }]
        },        
        {
          featureType: 'road.arterial',
          elementType: 'labels',
          stylers: [{visibility: 'off' }]
        }        
      ],
      {name: 'verejne.digital'});



  /* Init map API */
  var centerLatLng = {lat: 48.600, lng: 19.500};

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    center: centerLatLng,
    mapTypeControlOptions: {
      mapTypeIds: ['satellite','styled_map']
    }
  });

  global_map = map;
  map.mapTypes.set('styled_map', styledMapType);
  map.setMapTypeId('styled_map');

  map.addListener('zoom_changed', function() {
    if (!server_calls_enabled) return;
    console.log('Zoom changed');    
    getEntities(map);    
  });

  map.addListener('dragend', function() {
    if (!server_calls_enabled) return;
    console.log('Map dragged.');    
    getEntities(map);    
  });

  /* Init Address Search */
  var input = document.getElementById('search-field');
  var searchBox = new google.maps.places.SearchBox(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
       searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();
    if (places.length == 0) return;
    var place = places[0];
    var bounds = new google.maps.LatLngBounds();
    if (place.geometry.viewport)  bounds.union(place.geometry.viewport);
    else bounds.extend(place.geometry.location);
    // TODO: function for this
    server_calls_enabled = false; 
    map.setOptions({ maxZoom: kZoomForEntity + 2 });
    map.fitBounds(bounds)
    map.setOptions({ maxZoom: null });
    server_calls_enabled = true; 
    getEntities(map);
  });

  // add legend
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('legend'));
  var num = 200;
  searchString = window.location.search.substring(1);
  getEntities(map);   
}
