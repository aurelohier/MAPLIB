

// Configuration de la carte
var map = new maplibregl.Map({
    container: 'map',
    style: "https://openmaptiles.geo.data.gouv.fr/styles/positron/style.json", // Fond de carte par défaut
    zoom: 11.5,
    center: [-1.67, 48.11],
    pitch: 45, // Inclinaison
    bearing: 355 // Rotation
});





// Fonction pour ajouter les couches
function addLayers() {
    map.addSource('mapbox-streets-v8', {
        type: 'vector',
        url: 'https://openmaptiles.geo.data.gouv.fr/data/france-vector.json'
    });

  
  
  // Hydrologie
map.addLayer({"id": "hydrologie",
"type": "fill",
"source": "mapbox-streets-v8",
"source-layer": "water",
'layout': { "visibility": "visible" },
"paint": {"fill-color": "#4dd2ff"}

});
  
  

  
  //route
map.addLayer({
    "id": "Routes",
    "type": "line",
 "filter": ['in', 'class', 'trunk', 'primary',],

    "source": "mapbox-streets-v8",
    "layout": { "visibility": "visible" },
    "source-layer": "transportation",
    "paint": {
        "line-color": "grey",  // Correction : "fill-color" → "line-color" pour une ligne
        "line-opacity": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15, 1,   // À zoom 14, opacité = 1 (complètement visible)
            16, 0    // À zoom 15, opacité = 0 (disparaît progressivement)
        ]
    }
});
  
  
  

  
// BUS ARRET
 // Ajouter la source de données pour les arrêts de bus
map.addSource('Arrets', {
  type: 'vector',
  url: 'mapbox://ninanoun.58widelk'
});

// Ajouter la couche pour afficher les arrêts de bus
map.addLayer({
  'id': 'Arrets',
  'type': 'symbol',
  'source': 'Arrets',  // S'assurer que la source est définie ailleurs (GeoJSON ou autre source)
  'source-layer': 'Bus-5ypx1k',
  'layout': {
    'icon-image': 'zoo-15',  // Assurez-vous que cette icône est définie ou disponible dans Mapbox
    'icon-size': 2,  // Ajuste la taille de l'icône
    'icon-color': '#ffcc00'  // Utilisation de 'icon-color' pour la couleur de l'icône
  },
  'minzoom': 5  // La couche ne sera visible qu'à partir du niveau de zoom 10
});

  
  //BATIMENT 
map.addSource('BDTOPO', {
  type: 'vector',
  url: 'https://data.geopf.fr/tms/1.0.0/BDTOPO/metadata.json',
});

map.addLayer({
  'id': 'batiments',
  'type': 'fill-extrusion',
  'source': 'BDTOPO',
  'source-layer': 'batiment',
  'layout': {
    'visibility': 'visible'
  },
  'paint': {
    'fill-extrusion-color': [
      'interpolate',
      ['linear'],
      ['get', 'hauteur'],
      8, 'white', // Bleu clair
      12, '#6fa1e4', // Bleu moyen
      25, '#1e72cc', // Bleu
      40, '#135b8f', // Bleu foncé
      70, '#0b3a56'  // Bleu très foncé
    ],
    'fill-opacity': 0.9,
    'fill-extrusion-height': {
      'type': 'identity',
      'property': 'hauteur'
    },
    'fill-extrusion-opacity': 0.90,
    'fill-extrusion-base': 0
  },
  'filter': ['>', ['get', 'hauteur'], 10] // Filtre appliqué ici
});

  
  
  // AJOUT DU CADASTRE ETALAB

map.addSource('Cadastre', {
type: 'vector',
url: 'https://openmaptiles.geo.data.gouv.fr/data/cadastre.json' });

map.addLayer({

'id': 'Cadastre',
'type': 'line',
'source': 'Cadastre',
'source-layer': 'parcelles',
'filter': ['>','contenance',10000],
'layout': {'visibility': 'none'},
'paint': {'line-color': 'white'},
'minzoom':14});

map.setPaintProperty('communeslimites', 'line-width', ["interpolate",["exponential",1],["zoom"],16,0.3,18,1]);
  
  
  
  
// Contour de Rennes //  
dataCadastre = 'https://apicarto.ign.fr/api/cadastre/commune?code_insee=35238';
jQuery.when( jQuery.getJSON(dataCadastre)).done(function(json) {
for (i = 0; i < json.features.length; i++) {
json.features[i].geometry = json.features[i].geometry;
};
map.addLayer(
{'id': 'Contourcommune',
'type':'line',
'source': {'type': 'geojson','data': json},
'paint' : {'line-color': 'white',
'line-width':2.5},
'layout': {'visibility': 'none'},
});
});
  
  
  
  // PARC RELAIS
  $.getJSON('https://data.rennesmetropole.fr/api/explore/v2.1/catalog/datasets/tco-parcsrelais-star-etat-tr/records?limit=20',
function(data) {var geojsonData4 = {
type: 'FeatureCollection',
features: data.results.map(function(element) {
return {type: 'Feature',
geometry: {type: 'Point',
coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
properties: { name: element.nom,
capacity: element.jrdinfosoliste}};


})
};
map.addLayer({ 'id': 'Parcrelais',

'type':'circle',
'source': {'type': 'geojson',
'data': geojsonData4},
              'layout': {'visibility': 'visible'},
'paint': {'circle-color': '#D49A66',

'circle-radius': {property: 'capacity',
type: 'exponential',
stops: [[10, 5],[500, 20]]},
'circle-opacity': 0.8,
     'circle-opacity': 0.8,
    'circle-stroke-width': 2,
    'circle-stroke-color': "#ffffff",        
         
         
         },
            
});
});
  
  

  
  
  //PLU RM
  dataPLU = 'https://apicarto.ign.fr/api/gpu/zone-urba?partition=DU_243500139';
jQuery.when(jQuery.getJSON(dataPLU)).done(function(json) {
// Filtrer les entités pour ne garder que celles avec typezone = 'U'
var filteredFeatures = json.features.filter(function(feature)
{return feature.properties.typezone === 'N';});
// Créer un objet GeoJSON avec les entités filtrées
var filteredGeoJSON = { type: 'FeatureCollection', features: filteredFeatures};
map.addLayer({
'id': 'PLU',
'type': 'fill',
'source': {'type': 'geojson',
'data': filteredGeoJSON},
'layout':{'visibility':'none'},
'paint': {'fill-color': 'green',
'fill-opacity': 0.5},
});
});


  
  
 // Ajout des stations de vélo

  $.getJSON('https://data.explore.star.fr/api/explore/v2.1/catalog/datasets/vls-stations-etat-tr/records?limit=60',
function(data) {var geojsonVLS = {
type: 'FeatureCollection',
features: data.results.map(function(element) {
return {type: 'Feature',
geometry: {type: 'Point',
coordinates: [element.coordonnees.lon, element.coordonnees.lat]},
properties: { nom: element.nom,
emplacements: element.nombreemplacementsdisponibles, 
velos: element.nombrevelosdisponibles}};

})
};
map.addLayer({ 'id': 'VLS',

'type':'circle',
'source': {'type': 'geojson',
'data': geojsonVLS},
              'layout': {'visibility': 'none'},
'paint': {'circle-color': 'orange'}
});
});
   
 
  
  
  

  
  
  //region
map.addSource('region', {
    type: 'vector',
    url: 'mapbox://aurel-oh.3jch2t3e'
});

map.addLayer({
    'id': 'code',  // Change cet ID si nécessaire
    'type': 'fill-extrusion',  // Utilisation de 'fill-extrusion' pour l'effet 3D
    'source': 'region',  // La source est toujours 'region'
    'source-layer': 'regions-0h2bba',  // Assure-toi que le nom de la source-layer est correct
    'layout': { 'visibility': 'visible' },
    'paint': {
        'fill-extrusion-color': 'blue',  // Couleur de remplissage des régions extrudées
        'fill-extrusion-height':25000,  // Hauteur de l'extrusion (ajuste la valeur en fonction de tes données)
        'fill-extrusion-base': 10,  // Base de l'extrusion (par défaut à 0)
        'fill-extrusion-opacity': 0.5,  // Opacité de l'extrusion
    },
    'maxzoom': 12  // Zoom minimal pour afficher la couche
});

  
  
  //
}
// Fin d'appel des couches suplementaires







// Ajout des couches au chargement initial
map.on('load', addLayers);

// Gestion du changement de style
document.getElementById('style-selector').addEventListener('change', function () {
    map.setStyle(this.value);
    map.once('style.load', addLayers); // Recharge les couches après changement de style
});


  switchlayer = function (lname) {
            if (document.getElementById(lname + "CB").checked) {
                map.setLayoutProperty(lname, 'visibility', 'visible');
            } else {
                map.setLayoutProperty(lname, 'visibility', 'none');
           }
        }












// Interactivité CLICK pour les arrêts de bus
map.on('click', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['Arrets'] });
    if (!features.length) return;

    var feature = features[0];

    var popupContent = `
        <div class="popup-content">
            <h2 class="popup-title">${feature.properties.nom}</h2>
            <hr class="popup-hr">
            <p class="popup-text"><strong>🛋 Mobilier :</strong> ${feature.properties.mobilier}</p>
            <p class="popup-text"><strong>♿ Accessibilité PMR :</strong> ${feature.properties.estaccessiblepmr}</p>
        </div>`;

    new maplibgl.Popup({ offset: [0, -15] })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(popupContent)
        .addTo(map);
});

// Interactivité HOVER pour les parcs relais
var popup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false
});

map.on('mousemove', function(e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['Parcrelais'] });

    map.getCanvas().style.cursor = features.length ? 'pointer' : '';

    if (!features.length) {
        popup.remove();
        return;
    }

    var feature = features[0];

    popup.setLngLat(feature.geometry.coordinates)
        .setHTML(`
            <div class="popup-content">
                <h2 class="popup-title">${feature.properties.name}</h2>
                <hr class="popup-hr">
                <h3 class="popup-subtext">🚗 ${feature.properties.capacity || 'Non renseigné'} places disponibles</h3>
            </div>`)
        .addTo(map);
});

// Interactivité CLICK pour les stations VLS
map.on('click', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: ['VLS'] });
    if (!features.length) return;

    var feature = features[0];

    var popupContent = `
        <div class="popup-content">
            <h2 class="popup-title">${feature.properties.name}</h2>
            <hr class="popup-hr">
            <p class="popup-text"><strong>🚲 Vélo(s) disponible(s) :</strong> ${feature.properties.velos}</p>
            <p class="popup-text"><strong>🅿 Emplacement(s) disponible(s) :</strong> ${feature.properties.emplacements}</p>
        </div>`;

    new maplibregl.Popup({ offset: [0, -15] })
        .setLngLat(feature.geometry.coordinates)
        .setHTML(popupContent)
        .addTo(map);
});


document.getElementById('Gare').addEventListener('click', function ()
{ map.flyTo({zoom: 16,

center: [-1.672, 48.1043],
pitch: 70,
bearing: 40});

});


document.getElementById('Rennes2').addEventListener('click', function ()
{ map.flyTo({zoom: 16,

center: [-1.702792906912327, 48.11950686977639],
pitch: 70,
bearing: 40});

});