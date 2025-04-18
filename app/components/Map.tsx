const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

let mapOptions = {
    zoom: zoom,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapId: 'DEMO_MAP_ID' // Wymagane dla AdvancedMarkerElement
};

marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat, lng },
    map: map,
    title: name
}); 