
// Cấu hình bản đồ
let config = {
  minZoom: 7,
  maxZoom: 18,
};

// Độ phóng đại khi bản đồ được mở
const zoom = 18;

// Tọa độ Trường
const lat = 10.796501883372228;
const lng = 106.66680416611385;

// Khởi tạo bản đồ
const map = L.map("map", config).setView([lat, lng], zoom);
map.attributionControl.setPrefix(false);

// Được dùng để tải và trình các layer trên bản đồ
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);











const query = `
[out:json];
(
  node["shop"="supermarket"](10.3,106.5,10.9,107.1);  // Siêu thị trong khu vực TP.HCM
  node["amenity"="market"](10.3,106.5,10.9,107.1);    // Chợ trong khu vực TP.HCM
);
out body;
`;

// Gửi yêu cầu tới Overpass API
fetch('https://overpass-api.de/api/interpreter', {
  method: 'POST',
  body: new URLSearchParams({ data: query })
})
  .then(response => response.json())
  .then(data => {
    data.elements.forEach(element => {
      const lat = element.lat;
      const lng = element.lon;
      const name = element.tags.name || "Không tên";

      // Thêm marker vào bản đồ
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${name}</b>`)
        .openPopup();
    });
  })
  .catch(error => console.error("Lỗi khi lấy dữ liệu:", error));