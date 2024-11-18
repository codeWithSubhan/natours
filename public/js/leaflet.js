export const displayMap = (locations) => {
  var map = L.map("map", { zoomControl: false });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  const defaultIcon = new L.icon({
    iconUrl: "/img/pin.png",
    iconSize: [32, 40],
    popupAnchor: [0, -10],
  });

  const points = [];
  locations.forEach((loc) => {
    points.push([loc.coordinates[1], loc.coordinates[0]]);
    L.marker([loc.coordinates[1], loc.coordinates[0]], { icon: defaultIcon })
      .addTo(map)
      .bindPopup(`<p>Day ${loc.day}: ${loc.description}</p>`, {
        autoClose: false,
        closeOnClick: false,
        className: "mapPopup",
      })
      .openPopup();
  });

  const bounds = L.latLngBounds(points).pad(0.5);
  map.fitBounds(bounds);

  map.scrollWheelZoom.disable();
};
