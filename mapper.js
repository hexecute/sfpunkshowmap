// globals

var data;
var map;
var resp;

// 

var url = "http://www.foopee.com/punk/the-list/by-date.1.html";
var xpath = "//body/ul/li";
var query = "select * from html where url='" + url  + "' and xpath='" + xpath + "'";
var yql_url = "https://query.yahooapis.com/v1/public/yql?format=json&q=" + encodeURIComponent(query);


////////////
// foopee /
//////////

function get(url) {

  // Return a new promise.
  return new Promise(function(resolve, reject) {
  
  var req = new XMLHttpRequest();
  req.open('GET', url);

  req.onload = function() {
    if (req.status == 200) {
      resp = JSON.parse(req.response);
    resolve(console.log('Request success.'));;
    }
    else {
    reject(console.log(Error(req.statusText)));
    }
  };

  // Handle network errors
  req.onerror = function() {
    reject(Error("Network Error"));
  };

  req.send();
  });
}


////////////
// MAPBOX /
//////////


function setupMap(){
  // Return a new promise
  return new Promise(function(resolve, reject) {

    // easy to change online though if we suspect abuse
    L.mapbox.accessToken = 'pk.eyJ1IjoibWV0YXN5biIsImEiOiIwN2FmMDNhNTRhOWQ3NDExODI1MTllMDk1ODc3NTllZiJ9.Bye80QJ4r0RJsKj4Sre6KQ';

    // Init map
    map = L.mapbox.map('map', 'mapbox.streets')
      .setView([37.7600, -122.416], 14);
  

    if (map) {
    resolve(console.log('Map is loaded.'));
    }
    else {
    reject(console.log(Error('Map not loaded!')));
    }
  });
}


////////////
// VENUES /
//////////

// Note: geojson requires lon-lat, not lat-lon.

lonlatDictionary = {
  '924 Gilman Street, Berkeley': [-122.2993211, 37.8795371],
  'Hemlock, S.F.': [-122.420301, 37.787356],
  'Chapel, S.F.': [-122.421198, 37.760528],
  'Regency Ballroom, S.F.': [ -122.421573, 37.787836],
  'Thee Parkside, S.F.': [-122.3999114, 37.765222],
}

/////////////
// helpers /
///////////

function sortByDate(j){

  data = j['query']['results']['li'];

  organized = {}

  // loop through dates
  for (var i = 0; i < data.length; i++){

    organized[data[i]['a']['b']] = [];

    if (data[i]['ul']['li'].length == undefined){
      data[i]['ul']['li'] = Array(data[i]['ul']['li'])
    }

    // loop through shows
    for (var showIndex = 0; showIndex < data[i]['ul']['li'].length; showIndex++) { 

      var show = data[i]['ul']['li'][showIndex];
      var venue = show['b']['a']['content'];
      var details = show['content'].slice(0, -1); // new line at the end
      var lineup = show['a'];

      var bands = [];

      // loop through bands
      for (var bandIndex = 0; bandIndex < lineup.length; bandIndex++){
        bands.push(lineup[bandIndex]['content'])
      }

      organized[data[i]['a']['b']].push({
        'venue': venue,
        'date' : data[i]['a']['b'],
        'details': details,
        'bands': bands.join('\n')
      });
    }
  }
  return organized
}



function geojsonify(data){
  // this function returns a geojson object

  var features = []
  var dateKeys = Object.keys(data)

  // loop through dates
  for (var i = 0; i < dateKeys.length; i++){

    // loop through shows
    for (var j = 0; j < data[dateKeys[i]].length; j++){

      var show = {
        "type": "Feature",
        "geometry": {"type": "Point", "coordinates": lonlatDictionary[data[dateKeys[i]][j]['venue']] || [0, 0]},
        "properties": {
          "date": dateKeys[i],
          "venue": data[dateKeys[i]][j]['venue'],
          "bands": data[dateKeys[i]][j]['bands'],
          "details": data[dateKeys[i]][j]['details'],
          'marker-color': '#548cba',
          'marker-size': 'large',
          'marker-symbol': 'music'
        }
      }

      // add show to features array
      features.push(show)

    }
  }

  // format for valid geojson
  var geojson = { "type": "FeatureCollection", "features": features }
  return geojson
}



function plotShows(json){

  return new Promise(function(resolve, reject){

    // get that geojson
    var geojson = geojsonify(sortByDate(json));

    // empty layer
    var myLayer = L.mapbox.featureLayer().addTo(map)

    myLayer.on('layeradd', function(e) {
      var marker = e.layer,
        feature = marker.feature;

      // Create custom popup content
      var popupContent =  '<h1>' + feature.properties.venue + '</h1>' + '</br>' +
                '<h3>' + feature.properties.date + '</h3>' + '</br>' +
                '<h2>' + feature.properties.bands.split().join('\n') + '</h2>' + '</br>' +
                '</br></br>' + 
                '<h2>' + feature.properties.details + '</h2>' + '</br>';

      // http://leafletjs.com/reference.html#popup
      marker.bindPopup(popupContent,{
        closeButton: true,
        minWidth: 320
      });
    });

    myLayer.setGeoJSON(geojson);

    if (geojson){
      resolve(console.log('Shows plotted.'))
    }
    else { 
      reject(console.log(Error('Shows cannot be plotted.')));
    }
  });
}


///////////////////
// control logic /
/////////////////


get(yql_url).then(resolve => {setupMap(); plotShows(resp)})



///////////////
// gmaps api /
/////////////

// Note: I don't think I want to use these because they were pretty inacurate when using the venue descriptions
// from foopee. But I'm going to leave them here in case they get used as a catchall once the locations are all
// added to the lonlat dictionary.


function fetchGeo(venue){

  // api key
  var apiKey = "AIzaSyDCyj1LQMqFPcQhgfW92vR8BtXhlDIvF-4";
  // request
  var geocoder = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodeURIComponent(venue) + "&key=" + apiKey;
  
  return $.getJSON(geocoder, function(response){return response.responseJSON})
}

function extractLatLon(venue){
  geo = fetchGeo(venue);
  return {
    "address": geo.responseJSON.results[0].formatted_address,
    "location": geo.responseJSON.results[0].geometry.location
  }
}
