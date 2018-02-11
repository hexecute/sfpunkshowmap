/* GLOBAL */
let apiKeyDict;
// HX: Fix Alcatraz Island
// HX: Rename "shows" -> "events"
// HX: Restructuring
let map;
// HX: Rename
let myLayer;
let overlays;
// HX: Restructure
let filters;
let selectedDatesList;
// HX: Enter description here
// Note: geojson requires lon-lat, not lat-lon.
const lonlatDictionary = {};

/* CONSTANTS */

const csvUrl = 'https://cors.io/?https://19hz.info/events_BayArea.csv';
const locationsCSV = './csv/locations.csv';
const apiKeys = './csv/api_keys.csv';

/*
 * Convert 19hz.info CSV into the format used by sfpunkshowmap
 *
 * @param   (list) arr: CSV in a list format
 * @returns (dict): CSV in a format used by sfpunkshowmap with results
 *                  as dicts organized in lists by dates
 */
function nineteenHzParse(arr) {
    const rv = {};
    for (let i = 0; i < arr.length; i += 1) {
        const elem = arr[i];
        const date = elem[0].replace(':', '');
        if (!date.length) {
            console.log('Anomalous CSV data entry found:');
            console.log(elem);
        } else {
            if (!(date in rv)) {
                rv[date] = [];
            }
            rv[date].push({
                'venue': elem[3],
                'date': elem[0].replace(':', ''),
                'details': elem[2],
                'bands': [elem[1]]
            });
        }
    }
    // HX: Too many dates
    // HX: Handle date spans
    return rv;
}


function loadCSV(url) {
    // Return a new promise.
    return new Promise(((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open('GET', url);
        // HX: CORS

        req.onload = () => {
            try {
                if (req.status === 200) {
                    console.log('Request success.');
                    resolve(Papa.parse(req.response).data);
                } else {
                    reject(Error(req.statusText));
                }
            } catch (e) {
                console.log(`Error: ${ e } `);
                reject(Error(req.statusText));
            }
        };

        // Handle network errors
        req.onerror = () => {
            reject(Error('Network Error'));
        };

        req.send();
    }));
}


/*
MAPBOX
======
*/

// defaults
function ModifiedClusterGroup() {
    return new L.MarkerClusterGroup({
        spiderfyOnMaxZoom: true,
        maxClusterRadius: 1,
        spiderfyDistanceMultiplier: 3
        /* custom icons ?
            iconCreateFunction: function(cluster) {
              return L.mapbox.marker.icon({
                // show the number of markers in the cluster on the icon.
                'marker-symbol': cluster.getChildCount(),
                'marker-color': '#a0d6b4'
              });
            }
            */
    });
}


function setupMap() {
    // Return a new promise
    // HX: New promise necessary?
    return new Promise(((resolve, reject) => {
        // easy to change online though if we suspect abuse
        // HX: Replace with own
        L.mapbox.accessToken = 'pk.eyJ1IjoibWV0YXN5biIsImEiOiIwN2FmMDNhNTRhOWQ3NDExODI1MTllMDk1ODc3NTllZiJ9.Bye80QJ4r0RJsKj4Sre6KQ';

        // Init map
        map = L.mapbox.map('map', 'mapbox.dark', {
            maxZoom: 17
        })
            .setView([37.7600, -122.416], 13);

        // Locate me button
        L.control.locate().addTo(map);

        if (map) {
            console.log('Map is loaded.');
            resolve();
        } else {
            const error = Error('Map is not loaded!');
            reject(error);
        }
    }));
}

// filters
function populateDates(data) {
    // Grab form
    const form = document.getElementById('date-selector');
    const dates = Object.keys(data);

    let tempHTML = '<div>';
    for (let d = 0; d < dates.length; d += 1) {
        const leRadio = `<input type='checkbox' name='filters' onclick='showShows();' value='${ dates[d] }' checked>${ dates[d] }`;
        tempHTML += leRadio;
    }
    tempHTML += '</div>';
    form.innerHTML = tempHTML;
    filters = document.getElementById('date-selector').filters;
}

function showShows() {
    selectedDatesList = [];
    // first collect all of the checked boxes and create an array of strings
    // If there's only one element in filters
    if (filters.constructor.name === 'HTMLInputElement') {
        if (filters.checked) selectedDatesList.push(filters.value);
    } else {
        for (let i = 0; i < filters.length; i += 1) {
            const filter = filters[i];
            if (filter.checked) selectedDatesList.push(filter.value);
        }
    }
    // Remove any previously-displayed marker groups
    overlays.clearLayers();
    // Create a new marker group
    const clusterGroup = ModifiedClusterGroup().addTo(overlays);
    // Add any markers that fit the filtered criteria to that group.
    myLayer.eachLayer((layer) => {
        if (selectedDatesList.indexOf(layer.feature.properties.date) !== -1) {
            clusterGroup.addLayer(layer);
        }
    });

    // Update coordinates box
    window.onmove();
}


function geojsonify(data) {
    // this function returns a geojson object

    // format for valid geojson
    const rv = {
        'type': 'FeatureCollection',
        'features': []
    };

    const dateKeys = Object.keys(data);

    // loop through dates
    for (let i = 0; i < dateKeys.length; i += 1) {
        // loop through shows
        for (let j = 0; j < data[dateKeys[i]].length; j += 1) {
            const eventData = data[dateKeys[i]][j];
            const venueList = Object.keys(lonlatDictionary);

            // Check for misspellings
            if (!lonlatDictionary[eventData.venue]) {
                try {
                    for (let v = 0; v < venueList.length; v += 1) {
                        const misspelled = eventData.venue.replace(/\W/g, '');
                        // HX: Do this work one time for venueList for this function forever
                        const spelledCorrect = venueList[v].replace(/\W/g, '');
                    }
                } catch (e) {
                    console.log('Missing venue?', eventData, e);
                }
            }
            // Where is the show at?
            if (!lonlatDictionary[eventData.venue]) {
                getLonLat(eventData.venue);
            }
            eventData.coordinates = lonlatDictionary[eventData.venue] || [-122.422960, 37.826524];

            // Random color!
            // HX: Color should imply something
            // HX: Color implies location confidence
            const randomHex = Math.floor(Math.random() * 16777216).toString(16).padStart(6, '0');
            // HX: Fucking commas?
            // HX: Coordinates to 0,0 in fail case
            const show = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': eventData.coordinates
                },
                'properties': {
                    'date': dateKeys[i],
                    'venue': eventData.venue,
                    'bands': eventData.bands,
                    'details': eventData.details.replace(/ ,/g, ''), // fucking commas
                    'marker-color': `#${ randomHex }`,
                    'marker-size': 'large',
                    'marker-symbol': 'music'
                }
            };

            // add show to features array
            rv.features.push(show);
        }
    }

    return rv;
}


function plotShows(data) {
    // HX: Necessary?
    return new Promise(((resolve, reject) => {
        // update function for coordinates infobox
        window.onmove = function onmove() {
            // Get the map bounds - the top-left and bottom-right locations.
            const inBounds = [];
            const bounds = map.getBounds();
            clusterGroup.eachLayer((marker) => {
                // For each marker, consider whether it is currently visible by comparing
                // with the current map bounds.
                if (bounds.contains(marker.getLatLng()) &&
                    selectedDatesList.indexOf(marker.feature.properties.date) !== -1) {
                    const feature = marker.feature;
                    const coordsTemplate = L.mapbox.template('{{properties.date}} - {{properties.venue}} |{{#properties.bands}} {{.}} |{{/properties.bands}}{{properties.details}}', feature);
                    inBounds.push(coordsTemplate);
                }
            });
            // Display a list of markers.
            inBounds.reverse();
            document.getElementById('coordinates').innerHTML = inBounds.join('\n');
        };


        // get that geojson
        const geojson = geojsonify(data);

        // attach data
        myLayer = L.mapbox.featureLayer(geojson);

        // make clustergroup
        const clusterGroup = ModifiedClusterGroup();
        // add features
        clusterGroup.addLayer(myLayer);
        overlays = L.layerGroup().addTo(map);
        // add cluster layer
        // overlays are multiple layers
        // add in showShows()
        showShows();

        // for each layer in feature layer
        myLayer.eachLayer((e) => {
            const marker = e;
            const feature = e.feature;

            // Create custom popup content
            const popupContent = L.mapbox.template('<h1> {{properties.venue}} </h1><br><h3> {{properties.date}} </h3><br><h2> {{#properties.bands}} - {{.}} <br> {{/properties.bands}} </h2><br><h2> {{properties.details}} </h2><br>', feature);

            marker.bindPopup(popupContent, {
                closeButton: true,
                minWidth: 320
            });
        });


        map.on('move', window.onmove);
        // call onmove off the bat so that the list is populated.
        // otherwise, there will be no markers listed until the map is moved.
        window.onmove();


        if (geojson) {
            console.log('Shows plotted.');
            resolve();
        } else {
            reject(Error('Shows cannot be plotted.'));
        }
    }));
}


/**
 * Something about a vex modal
 *
 * Hexecute: This does some sort of UI setup. That's all I know.
 */
function modalPop() {
    const modalMessage = $('#modal-template').html();
    vex.defaultOptions.className = 'vex-theme-flat-attack';
    $('#q').on('click hover', vex.dialog.alert(modalMessage));
}


/**
 * CONTROL LOGIC
 * =============
 */
// HX: Set up UI first in case network calls take time
// HX: Async somehow
modalPop();
// HX: Fix async loading
// HX: Fix CSV loading
loadCSV(locationsCSV).then((csvData) => {
    for (let i = 0; i < csvData.length; i += 1) {
        const row = csvData[i];
        lonlatDictionary[row[0]] = [row[1], row[2]];
    }
});
loadCSV(apiKeys).then((apiKeyData) => {
    apiKeyDict = apiKeyData[0][1];
});

loadCSV(csvUrl).then((csvData) => {
    const data = nineteenHzParse(csvData);
    try {
        setupMap();
    } catch (err) {
        vex.dialog.alert('OH SHIT SOMETHINGS BROKEN. rawgit could be mad or my code could be broken.');
    }
    populateDates(data);
    plotShows(data);
});
