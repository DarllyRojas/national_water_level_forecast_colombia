// ------------------------------------------------------------------------------------------------------------ //
//                                          GLOBAL AND STATE VARIABLES                                          //
// ------------------------------------------------------------------------------------------------------------ //

// Server domain (DNS or IP:port)
const server = "http://localhost:8080";




// ------------------------------------------------------------------------------------------------------------ //
//                                              INITIALIZE THE MAP                                              //
// ------------------------------------------------------------------------------------------------------------ //

// Ajust the map to the window height
const height = $(window).height() - 50;
$("#map-container").height(height);

// Set the map container
var map = L.map("map-container", {
    zoomControl: false,
}).setView([4.5988, -74.08], 5);

// Add the base map
L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Add the zoom control
L.control.zoom({ 
    position: "bottomright"
}).addTo(map);


// ------------------------------------------------------------------------------------------------------------ //
//                                     COLOR MARKER ACCORDING TO THE ALERT                                      //
// ------------------------------------------------------------------------------------------------------------ //

// Function to construct Icon Marker
function IconMarker(rp) {
  const IconMarkerR = new L.Icon({
    iconUrl: `${server}/static/national_water_level_forecast_colombia/images/icon_popup/${rp}.png`,
    shadowUrl: `${server}/static/national_water_level_forecast_colombia/images/icon_popup/marker-shadow.png`,
    iconSize: [9, 14],
    iconAnchor: [5, 14],
    popupAnchor: [1, -14],
    shadowSize: [14, 14],
  });
  return IconMarkerR;
}

// Icon markers for each return period
const IconR000 = IconMarker("0");       // RP: 0 years
const IconR002 = IconMarker("2");      // RP: 2 years
const IconR005 = IconMarker("5");        // RP: 5 years
const IconR010 = IconMarker("10");      // RP: 10 years
const IconR025 = IconMarker("25");         // RP: 25 years
const IconR050 = IconMarker("50");      // RP: 50 years
const IconR100 = IconMarker("100");       // RP: 100 years

const IconL_1 = IconMarker("lower_1");  // Low 7q10 from 1 to 3 days
const IconL_3 = IconMarker("lower_3");  // Low 7q10 from 3 to 7 days
const IconL_7 = IconMarker("lower_7");  // Low 7q10 from 7 to plus days


// Customized icon function
function IconParse(feature, latlng) {
    switch (feature.properties.alert) {
        case "R0":
            StationIcon = IconR000;
            break;
        case "R2":
            StationIcon = IconR002;
            break;
        case "R5":
            StationIcon = IconR005;
            break;
        case "R10":
            StationIcon = IconR010;
            break;
        case "R25":
            StationIcon = IconR025;
            break;
        case "R50":
            StationIcon = IconR050;
            break;
        case "R100":
            StationIcon = IconR100;
            break;

        case "lower_1":
            StationIcon = IconL_1;
            break;
        case "lower_3":
            StationIcon = IconL_3;
            break;
        case "lower_7":
            StationIcon = IconL_7;
            break;
    }
    return L.marker(latlng, { icon: StationIcon });
}



// ------------------------------------------------------------------------------------------------------------ //
//                                            PANEL DATA INFORMATION                                            //
// ------------------------------------------------------------------------------------------------------------ //
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function get_data_station(code, comid, name, river, basin, latitude, longitude, altitude, locality1, locality2, locality3){
    // Add data to the panel
    $("#panel-title-custom").html(`${code.toUpperCase()} - ${name.toUpperCase()}`)
    $("#station-comid-custom").html(`<b>COMID:</b> &nbsp ${comid}`)
    $("#station-river-custom").html(`<b>RIO:</b> &nbsp ${river.toUpperCase()}`)
    $("#station-basin-custom").html(`<b>CUENCA:</b> &nbsp ${basin.toUpperCase()}`)
    $("#station-latitude-custom").html(`<b>LATITUD:</b> &nbsp ${latitude.toUpperCase()}`)
    $("#station-longitude-custom").html(`<b>LONGITUD:</b> &nbsp ${longitude.toUpperCase()}`)
    $("#station-altitude-custom").html(`<b>ALTITUD:</b> &nbsp ${altitude.toUpperCase()} msnm`)
    $("#station-locality1-custom").html(`<b>ÁREA OPERATIVA:</b> &nbsp ${locality1.toUpperCase()}`)
    $("#station-locality2-custom").html(`<b>ÁREA HIDROGRÁFICA:</b> &nbsp ${locality2.toUpperCase()}`)
    $("#station-locality3-custom").html(`<b>DEPARTAMENTO:</b> &nbsp ${locality3.toUpperCase()}`)

    loader = `<div class="loading-container" style="height: 350px; padding-top: 12px;"> 
                        <div class="loading"> 
                        <h2>LOADING DATA</h2>
                            <span></span><span></span><span></span><span></span><span></span><span></span><span></span> 
                        </div>
                    </div>`;

    // Add the dynamic loader
    $("#hydrograph").html(loader)
    $("#visual-analisis").html(loader)
    $("#metrics").html(loader)
    $("#forecast").html(loader)
    $("#corrected-forecast").html(loader)

    // We need stop 300ms to obtain the width of the panel-tab-content
    await sleep(300);

    // Retrieve the data
    $.ajax({
        type: 'GET', 
        url: "get-data",
        data: {
            codigo: code.toLowerCase(),
            comid: comid,
            nombre: name.toUpperCase(),
            width: `${$("#panel-tab-content").width()}`
        }
    }).done(function(response){
        // Render the panel data
        $("#modal-body-panel-custom").html(response);

        // Set active variables for panel data
        active_code = code.toLowerCase();
        active_comid = comid;
        active_name = name.toUpperCase();
    })
}



// ------------------------------------------------------------------------------------------------------------ //
//                                          INFORMATION ABOUT STATIONS                                          //
// ------------------------------------------------------------------------------------------------------------ //

// Dinamic popups
function onEachFeature(feature, layer) {
    layer.bindPopup(
        "<div class='popup-container'>"+
            "<div class='popup-title'><b> DATOS DE LA ESTACION </b></div>"+
               "<table style='font-size:12px'>"+
                "<tbody>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>CODIGO: </th>"+
                        "<td class='popup-cell'>" + feature.properties.code.toUpperCase() + "</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>NOMBRE: </th>"+
                        "<td class='popup-cell'>" + feature.properties.name.toUpperCase().slice(0,20) + "</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>RIO: </th>"+
                        "<td class='popup-cell'>" + feature.properties.river + "</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>ZONA HIDROGRÁFICA: </th>"+
                        "<td class='popup-cell'>" + feature.properties.basin + "</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>LATITUD: </th>"+
                        "<td class='popup-cell'>" + round10(parseFloat(feature.geometry.coordinates[1]), -4) + "</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>LONGITUD: </th>"+
                        "<td class='popup-cell'>" + round10(parseFloat(feature.geometry.coordinates[0]), -4) + "</td>"+
                    "</tr>"+
                    "<tr>"+
                        "<th class='popup-cell-title popup-cell'>ALTITUD: </th>"+
                        "<td class='popup-cell'>" + feature.properties.elevation + " msnm</td>"+ 
                    "</tr>"+
                "</tbody>"+
            "</table>"+ 
            "<br>"+ 
            
            "<div data-bs-toggle='tooltip'>"+
                "<div data-bs-toggle='modal' data-bs-target='#panel-modal'>" + 
                    "<button style='font-size:14px !important;' class='btn btn-primary popup-button' onclick='get_data_station(" + 
                        '"' + feature.properties.code + '",' +
                        '"' + feature.properties.comid + '",' +
                        '"' + feature.properties.name + '",' + 
                        '"' + feature.properties.river + '",' + 
                        '"' + feature.properties.basin + '",' + 
                        '"' + round10(parseFloat(feature.geometry.coordinates[1]), -4) + '",' + 
                        '"' + round10(parseFloat(feature.geometry.coordinates[0]), -4) + '",' + 
                        '"' + feature.properties.elevation + '",' + 
                        '"' + feature.properties.loc1 + '",' + 
                        '"' + feature.properties.loc2 + '",' + 
                        '"' + feature.properties.loc3 + '",' + 
                    ");' >"+
                        "<i class='fa fa-download'></i>&nbsp;Visualizar Datos"+
                    "</button>"+
                "</div>"+ 
            "</div>"+
        "</div>");
    layer.openPopup();
};



window.onload = function () {
  // Load drainage network


  var url = 'https://geoserver.hydroshare.org/geoserver/HS-dd069299816c4f1b82cd1fb2d59ec0ab/wms';
  L.tileLayer.wms(url + "?service=WMS&",
                    {layers  : 'HS-dd069299816c4f1b82cd1fb2d59ec0ab:colombia_geoglows_drainage_v1',
                    format  : 'image/vnd.jpeg-png',
                    version : '1.1.0',
                    transparent: true,
                    srs     : 'EPSG:4326',
                    opacity: 0.65,
                    }
                    ).addTo(map);

  // Load stations 
  fetch("get-stations")
    .then((response) => (layer = response.json()))
    .then((layer) => {
        est_layer = layer.features.map( item => item.properties);

        // Filter by alert
        est_R000 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R0"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R000.addTo(map);

        est_R002 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R2"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R002.addTo(map);

        est_R005 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R5"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R005.addTo(map);

        est_R010 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R10"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R010.addTo(map);

        est_R025 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R25"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R025.addTo(map);

        est_R050 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R50"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R050.addTo(map);

        est_R100 = L.geoJSON(layer.features.filter(item => item.properties.alert === "R100"), {
            pointToLayer: IconParse,
            onEachFeature: onEachFeature,
        });
        est_R100.addTo(map);

        // Filter by low alert
        est_L_1 = L.geoJSON(layer.features.filter(item => item.properties.alert === "lower_1"), {
            pointToLayer : IconParse,
            onEachFeature: onEachFeature,
        });
        est_L_1.addTo(map);

        est_L_3 = L.geoJSON(layer.features.filter(item => item.properties.alert === "lower_3"), {
            pointToLayer : IconParse,
            onEachFeature: onEachFeature,
        });
        est_L_3.addTo(map);

        est_L_7 = L.geoJSON(layer.features.filter(item => item.properties.alert === "lower_7"), {
            pointToLayer : IconParse,
            onEachFeature: onEachFeature,
        });
        est_L_7.addTo(map);

    });
};















