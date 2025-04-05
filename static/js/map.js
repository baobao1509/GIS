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
L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="#">LT GIS </a> cơ bản',
}).addTo(map);

const query = `
[out:json];
area[name="Thành phố Hồ Chí Minh"]->.searchArea;
(
  node["shop"="supermarket"](area.searchArea);  // Siêu thị trong khu vực TP.HCM
  node["amenity"="market"](area.searchArea);    // Chợ trong khu vực TP.HCM
);
out body;
`;
const overpassUrl = "http://overpass-api.de/api/interpreter";
const overpassQuery = query;














// 🏪 Tạo icon cho siêu thị và chợ
const supermarketIcon = L.icon({
  iconUrl: "/static/leaflet/images/supermarket.png", // Cập nhật đường dẫn ảnh icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

const marketIcon = L.icon({
  iconUrl: "/static/leaflet/imgage/market.png", // Cập nhật đường dẫn ảnh icon
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});


























fetch("/static/chuyen_doi_quan_cafe.csv") // Đảm bảo đường dẫn đúng
  .then((response) => response.text())
  .then((csvText) => {
    let rows = csvText.split("\n").slice(1); // Bỏ dòng tiêu đề
    rows.forEach((row) => {
      let cols = row.split(","); // Tách các cột
      if (cols.length >= 7) {
        let lat = parseFloat(cols[1]);
        let lon = parseFloat(cols[2]);
        let name = cols[3] || "Không rõ";
        let shopType = cols[4] || "Không xác định";
        let openingHours = cols[5] || "Không có thông tin";
        let address = cols[6] || "Chưa được cập nhật";


        if (!isNaN(lat) && !isNaN(lon)) {
          // Xác định icon theo loại cửa hàng
          let icon = shopType.toLowerCase().includes("supermarket") ? supermarketIcon : marketIcon;

          // Tạo popup nội dung
          let popupContent = `
            <b>${name}</b><br>
            Loại: ${shopType}<br>
            Giờ mở cửa: ${openingHours}<br>
            Địa chỉ: ${address}
          `;

          L.marker([lat, lon], { icon: icon })
            .addTo(map)
            .bindPopup(popupContent);
        }
      }
    });
  })
  .catch((error) => console.error("Lỗi khi tải CSV:", error));




  // Hiển thị vị trí của người dùng trên bản đồ
  // Tạo icon cho vị trí người dùng
  const userIcon = L.icon({
    iconUrl: "/static/leaflet/images/user-location.png", // Cập nhật đường dẫn nếu có icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  map.locate({
    setView: true,              // Tự động đưa bản đồ về vị trí người dùng
    enableHighAccuracy: true   // Cố gắng lấy vị trí chính xác nhất
  })
  // Nếu tìm được vị trí → hiển thị marker
  .on("locationfound", (e) => {
    // Tạo marker tại vị trí người dùng
    const marker = L.marker([e.latitude, e.longitude],{icon:userIcon}).addTo(map)
      .bindPopup("Vị trí hiện tại của bạn");
    // Thêm marker và circle vào bản đồ
    map.addLayer(marker);
  })
  
  // Nếu có lỗi (ví dụ người dùng từ chối chia sẻ vị trí)
  .on("locationerror", (e) => {
    alert("Không thể lấy vị trí của bạn: " );
  });
  

