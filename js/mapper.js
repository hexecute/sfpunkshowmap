// globals
// HX: Fix Alcatraz Island
// HX: Fix single or double quotes
// HX: Coding standards
// HX: Restructuring
let map;
// HX: Rename
let myLayer;
let overlays;
// HX: Restructure
let filters;
let selectedDatesList;

/* CONSTANTS */

const csvUrl = 'https://cors.io/?https://19hz.info/events_BayArea.csv';

// Note: geojson requires lon-lat, not lat-lon.
// Convert to load from a file
const lonlatDictionary = {
    '924 Gilman Street, Berkeley': [-122.2993211, 37.8795371],
    'DNA Lounge, S.F.': [122.4126746, 37.7710559],
    'Eagle, S.F.': [122.4133666, 37.7700044],
    'Jazzschool, 2087 Addison Street, Berkeley': [122.2709651, 37.8712507],
    'Warfield, S.F.': [122.4123447, 37.782739],
    'Neck of the Woods, S.F.': [122.4657314, 37.784179],
    'Lost Church, 65 Capp, S.F.': [122.418409, 37.765783],
    'Starline Social Club, 2232 MLK, Oakland': [122.27253, 37.8122828],
    'Second Act, 1727 Haight Street, S.F.': [122.4534067, 37.769298],
    'Amoeba Music, S.F.': [122.4548087, 37.768922],
    'Lobot Gallery, 1800 Campbell St., Oakland': [122.2948787, 37.814835],
    'Civic Center, S.F.': [-122.4195095, 37.7780757],
    'Amnesia, S.F.': [122.4233043, 37.75931],
    'Amnesia, 853 Valencia at 20th, S.F.': [122.4233043, 37.75931],
    'Crate, 420 14th Street, Oakland': [-122.2703209, 37.8042683],
    'Golden Bull, Oakland': [122.2724634, 37.8042002],
    'Metro, Oakland': [122.2777909, 37.797058],
    'Mezzanine, S.F.': [122.4102674, 37.7825541],
    'UC Theater, Berkeley': [122.2719536, 37.8718207],
    'Legionnaire Saloon, Oakland': [122.2708187, 37.8123826],
    'Merchants Saloon, 401 2nd Street, Oakland': [122.2775095, 37.7954984],
    'Masonic, S.F.': [-122.4153747, 37.791287],
    'Hemlock, S.F.': [-122.420301, 37.787356],
    'Chapel, S.F.': [-122.421198, 37.760528],
    'Regency Ballroom, S.F.': [-122.421573, 37.787836],
    'Thee Parkside, S.F.': [-122.3999114, 37.765222],
    'El Rio, S.F.': [-122.4216143, 37.7468],
    'Knockout, S.F.': [-122.4221129, 37.7451999],
    'Bottom of the Hill, S.F.': [-122.3986239, 37.7649937],
    'Great American Music Hall, S.F.': [-122.4210104, 37.784807],
    'Fillmore, S.F.': [-122.4352607, 37.7839302],
    'Rickshaw Stop, S.F.': [-122.422641, 37.7760029],
    'Independent, S.F.': [-122.4398436, 37.7755465],
    'Civic Center, 99 Grove Street, S.F.': [-122.4195095, 37.7780757],
    'Masonic, S.F': [-122.4153748, 37.7912915],
    'Plough and Stars, 116 Clement St., S.F.': [-122.4627223, 37.7832646],
    'Monarch, 101 6th Street, S.F.': [-122.410645, 37.7810082],
    'Senator Theater, Chico': [-121.8397472, 39.728102],
    'Social Hall, S.F.': [-122.4234378, 37.7877708],
    'Bender\'s, S.F.': [-122.4194942, 37.7601859],
    'Fox Theater, Oakland': [-122.2722522, 37.8080016],
    'Night Light, Oakland': [-122.2781325, 37.7971539],
    'Stork Club, Oakland': [-122.2706259, 37.8131318],
    'Music City, 1353 Bush Street, S.F.': [-122.4195814, 37.7885446],
    '518 Valencia, S.F.': [-122.4243926, 37.7644923],
    'Annex, 468 3rd Street, Oakland': [-122.2766342, 37.7972863],
    'Honey Hive Gallery, 4117 Judah Street, S.F.': [-122.5063551, 37.7601905],
    'Institute for Integral Studies, 1453 Mission Street, S.F.': [-122.4185198, 37.7746224],
    'Artist\'s Television Access, 992 Valencia St., S.F.': [-122.4236529, 37.7570751],
    'New Parish, Oakland': [-122.2747969, 37.8076511],
    'Bimbo\'s 365 Club, S.F.': [-122.4155251, 37.8037564],
    'Elbo Room, S.F.': [-122.4215391, 37.7625099],
    'Slim\'s, S.F.': [-122.4154437, 37.7714655],
    'Brick and Mortar, S.F.': [-122.4226282, 37.7697351],
    'Catalyst Atrium, Santa Cruz': [-122.0259175, 36.9712949],
    'Sweetwater Music Hall, Mill Valley': [-122.550201, 37.9069745],
    'Harlow\'s, Sacramento': [-121.4701893, 38.573828],
    'Catalyst, Santa Cruz': [-122.0281115, 36.9712992],
    'Caravan Lounge, San Jose': [-121.8946633, 37.3329336],
    'Public Works, 161 Erie Street at Mission, S.F.': [-122.4194268, 37.7688759],
    'Greek Theater, UC Berkeley Campus': [-122.2566602, 37.8735759],
    'El Rey Theater, Chico': [-121.8441985, 39.7295038],
    'Hatch, 402 15th Street, Oakland': [-122.2717416, 37.8050561],
    'Octopus Literary Salon, Oakland': [-122.2676085, 37.8104379],
    'Milk Bar, 1840 Haight St., S.F.': [-122.4548054, 37.7695363],
    'Starline Social Club, Oakland': [-122.272508, 37.812282],
    'Sharon Meadow, Golden Gate Park, S.F.': [-122.4576422, 37.7680894],
    'Robert Mondavi Winery, Oakville': [-122.4096888, 38.4414921],
    'Plough and Stars, S.F.': [-122.4605347, 37.7832657],
    'Planet Gemini, 2110 Fremont Street, Monterey': [-121.861826, 36.595963],
    'Phoenix Theater, Petaluma': [-122.6430667, 38.2348794],
    'Cornerstone, Berkeley': [-122.2671952, 37.8663488],
    'Yoshi\'s, Oakland': [-122.2785532, 37.796237],
    'Streetlight Records, Santa Cruz': [-122.0253594, 36.9707881],
    'Maltese, 1600 Park Avenue, Chico': [-121.8271249, 39.7212474],
    'Cafe du Nord, S.F.': [-122.4304562, 37.7667174],
    'Shoreline Amphitheater, Mountain View': [-122.080765, 37.4268879],
    'Eli\'s Mile High Club, Oakland': [-122.269671, 37.825786],
    'Rite Spot, S.F.': [-122.4149695, 37.7638409],
};

/*
 * Convert 19hz.info CSV into the format used by sfpunkshowmap
 *
 * @param   (list) arr: CSV in a list format
 * @returns (dict): CSV in a format used by sfpunkshowmap with results
 *                  as dicts organized in lists by dates
 */
function nineteenHzParse(arr) {
    const rv = {};
    for (const elem of arr) {
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


function get(url) {
    // Return a new promise.
    return new Promise(((resolve, reject) => {
        const req = new XMLHttpRequest();
        req.open('GET', url);
        // HX: CORS

        req.onload = () => {
            if (req.status === 200) {
                const csvData = Papa.parse(req.response).data;
                const data = nineteenHzParse(csvData);
                console.log('Request success.');
                resolve(data);
            } else {
                const error = Error(req.statusText);
                reject(error);
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
        for (const filter of filters) {
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

/*
 * Compute the edit distance between the two given strings
 *
 * @param   (string) a
 * @param   (string) b
 * @returns (Number)
 */
function getEditDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];

    // increment along the first column of each row
    let i;
    for (i = 0; i <= b.length; i += 1) {
        matrix[i] = [i];
    }

    // increment each column in the first row
    let j;
    for (j = 0; j <= a.length; j += 1) {
        matrix[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (i = 1; i <= b.length; i += 1) {
        for (j = 1; j <= a.length; j += 1) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1
                    )
                ); // deletion
            }
        }
    }
    return matrix[b.length][a.length];
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
            const showData = data[dateKeys[i]][j];
            const venueList = Object.keys(lonlatDictionary);

            // Check for misspellings
            if (!lonlatDictionary[showData.venue]) {
                try {
                    for (let v = 0; v < venueList.length; v += 1) {
                        const misspelled = showData.venue.replace(/\W/g, '');
                        const spelledCorrect = venueList[v].replace(/\W/g, '');
                        const editDistance = getEditDistance(misspelled, spelledCorrect);
                        if (editDistance <= 3) {
                            console.log(`"${ showData.venue }" has been replaced with "${ venueList[v] }"`);
                            showData.venue = venueList[v];
                        }
                    }
                } catch (e) {
                    console.log('Missing venue?', e);
                }
            }

            const show = {
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': lonlatDictionary[showData.venue] || [-122.422960, 37.826524]
                },
                'properties': {
                    'date': dateKeys[i],
                    'venue': showData.venue,
                    'bands': showData.bands,
                    'details': showData.details.replace(/ ,/g, ''), // fucking commas
                    'marker-color': '#33CC33', //+Math.floor(Math.random()*16777215).toString(16), //random colors !
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
get(csvUrl).then((data) => {
    try {
        setupMap();
    } catch (err) {
        vex.dialog.alert('OH SHIT SOMETHINGS BROKEN. rawgit could be mad or my code could be broken.');
    }
    populateDates(data);
    plotShows(data);
});


/* gmaps api */

// Note: I don't think I want to use these because they were pretty inacurate
// when using the venue descriptions
// from foopee. But I'm going to leave them here in case they get used as a
// catchall once the locations are all
// added to the lonlat dictionary.


// HX: Keep this?
function fetchGeo(venue) {
    return new Promise((resolve, reject) => {
        // api key
        // request
        const geocoder = `https://maps.googleapis.com/maps/api/geocode/json?address=${ encodeURIComponent(venue) }&key=${ apiKey }`;

        $.getJSON(geocoder, (response) => {
            if (response) {
                console.log('Looked up venue.');
                resolve(response);
            } else {
                const error = Error('Venue lookup failure.');
                reject(error);
            }
        });
    });
}


function getLonLat(venue) {
    fetchGeo(venue).then(
        response => [response.results[0].geometry.location.lng,
            response.results[0].geometry.location.lat]);
}

