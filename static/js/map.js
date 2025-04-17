// Cấu hình bản đồ
let config = {
  minZoom: 7,
  maxZoom: 18,
  fullscreenControl: true,
        fullscreenControlOptions: {
            position: 'topleft'
        }
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
























const shopMarkers = []; // lưu các marker chợ/siêu thị
let shopsVisible = false;
  
function escapeString(str) {
  return String(str)
    .replace(/\\/g, '\\\\')           // Escape backslash
    .replace(/'/g, "\\'")             // Escape dấu nháy đơn
    .replace(/"/g, '')             // Escape dấu nháy kép
    .replace(/\n/g, ' ')              // Thay thế xuống dòng
    .replace(/\r/g, ' ')              // Thay thế carriage return
    .replace(/\u2028/g, '\\u2028')    // Escape line separator
    .replace(/\u2029/g, '\\u2029')    // Escape paragraph separator
    .replace(/</g, '&lt;')            // Chống XSS
    .replace(/>/g, '&gt;');           // Chống XSS
}
window.addEventListener('DOMContentLoaded', () => {
  fetch(`/static/chuyen_doi_quan_cafe.csv?t=${Date.now()}`)
    .then((response) => response.text())
    .then((csvText) => {
      let rows = csvText.split("\n").slice(1);
      rows.forEach((row) => {
        let cols = row.split(",", 8); // Đảm bảo đủ 8 cột
        if (cols.length >= 8) {
          let lat = parseFloat(cols[1]);
          let lon = parseFloat(cols[2]);
          let name = cols[3] || "Không rõ";
          let shopType = cols[4] || "Không xác định";
          let openingHours = cols[5] || "Không có thông tin";
          let address = cols[6] || "Chưa được cập nhật";
          let image = cols[7] || "Chưa được cập nhật";
          image = image.replace(/\\/g, "/");
          if (!isNaN(lat) && !isNaN(lon)) {
            let icon = shopType.toLowerCase().includes("supermarket") ? supermarketIcon : marketIcon;
            let popupContent = `
            <div style="font-family: Arial, sans-serif; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${name}</h3>
              
              <p style="margin: 4px 0;"><strong>Loại:</strong> ${shopType}</p>
              <p style="margin: 4px 0;"><strong>Giờ mở cửa:</strong> ${openingHours}</p>
              <p style="margin: 4px 0;"><strong>Địa chỉ:</strong> ${address}</p>
          
              <img src="/${image}" alt="Hình ảnh" style="width: 100%; height: auto; border-radius: 6px; margin: 10px 0;">
          
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <button 
                  onclick="toggleRoute(this, ${lat}, ${lon})" 
                  id="btn_duong_di"
                  style="
                    background-color: #007bff;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                  "
                >
                  Xem đường đi
                </button>
          
                <button 
                  onclick="goToContribution(${lat}, ${lon}, '${escapeString(name)}', '${escapeString(openingHours)}', '${escapeString(address)}', '${escapeString(shopType)}', '${escapeString(image)}')"
                  style="
                    background-color: #28a745;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                  "
                >
                  Đóng góp
                </button>
              </div>
            </div>
          `;          
            let marker = L.marker([lat, lon], { icon: icon }).bindPopup(popupContent);
            shopMarkers.push(marker);
          }
        }
      });
    })
    .catch((error) => console.error("Lỗi khi tải CSV:", error));
});


const routeBtn = document.getElementById("btn_duong_di");

// Hàm hiển thị/ẩn chợ và siêu thị
  function toggleShopsAndMarkets() {
    const button = document.getElementById("toggleMarkersBtn");
  
    if (shopsVisible) {
      // Ẩn marker
      shopMarkers.forEach(marker => map.removeLayer(marker));
      // Xóa đường đi nếu đang có
    if (routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }
      button.textContent = "Hiển thị chợ và siêu thị";
    } else {
      // Hiện marker
      shopMarkers.forEach(marker => marker.addTo(map));
      button.textContent = "Ẩn chợ và siêu thị";
    }
  
    shopsVisible = !shopsVisible;
  }
  

  







  // Hiển thị vị trí của người dùng trên bản đồ
  // Tạo icon cho vị trí người dùng
  const userIcon = L.icon({
    iconUrl: "/static/leaflet/images/user-location.png", // Cập nhật đường dẫn nếu có icon
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });


  let userLocation = null;
  let routeControl = null;
  map.locate({
    setView: true,              // Tự động đưa bản đồ về vị trí người dùng
    enableHighAccuracy: true   // Cố gắng lấy vị trí chính xác nhất
  })
  // Nếu tìm được vị trí → hiển thị marker
  .on("locationfound", (e) => {
    userLocation = [e.latitude, e.longitude]; // Lưu lại vị trí người dùng
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
  




  



//Hàm xóa đường đi
  function toggleRoute(button, destLat, destLng) {
    if (button.textContent === "Xem đường đi") {
      if (!userLocation) {
        alert("Chưa xác định được vị trí của bạn.");
        return;
      }
  
      // Xóa tuyến cũ nếu có
      if (routeControl) {
        map.removeControl(routeControl);
      }
  
      // Tạo tuyến đường mới
      routeControl = L.Routing.control({
        waypoints: [
          L.latLng(userLocation[0], userLocation[1]),
          L.latLng(destLat, destLng)
        ],
        routeWhileDragging: false,
        show: true,
        addWaypoints: false,
        lineOptions: {
          styles: [{ color: 'blue', weight: 4, opacity: 0.7 }]
      },
        createMarker: () => null // Không tạo thêm marker mặc định
      }).addTo(map);
  
      // Đổi tên nút
      button.textContent = "Xóa đường đi";
    } else {
      // Xóa đường đi
      if (routeControl) {
        map.removeControl(routeControl);
        routeControl = null;
      }
      // Đổi tên nút lại
      button.textContent = "Xem đường đi";
    }
  }
  



//Hàm tìm đến chợ hoặc siêu thị gần nhất
  function routeToNearestShop() {
    if (!userLocation) {
      alert("Không thể xác định vị trí của bạn.");
      return;
    }
  
    if (shopMarkers.length === 0) {
      alert("Chưa có dữ liệu chợ hoặc siêu thị.");
      return;
    }
  
    // Tìm marker gần nhất
    let nearestMarker = null;
    let minDistance = Infinity;
  
    shopMarkers.forEach(marker => {
      const latlng = marker.getLatLng();
      const distance = map.distance(userLocation, latlng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestMarker = marker;
      }
    });
  
    if (!nearestMarker) {
      alert("Không tìm được địa điểm gần nhất.");
      return;
    }
  
    // Xóa tuyến cũ nếu có
    if (routeControl) {
      map.removeControl(routeControl);
    }
  
    // Tạo tuyến đường tới địa điểm gần nhất
    // Tạo tuyến đường tới địa điểm gần nhất
    routeControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        nearestMarker.getLatLng()
      ],
      routeWhileDragging: false,
      addWaypoints: false,
      lineOptions: {
        styles: [{ color: 'blue', weight: 4, opacity: 0.7 }]
    },
      createMarker: () => null
    }).addTo(map);

    // LUÔN thêm marker vào bản đồ
    nearestMarker.addTo(map);
    
    //Đổi button thành xóa đường đi
    nearestMarker.openPopup();
    setTimeout(() => {
      const popup = document.querySelector(".leaflet-popup-content");
      const btn = popup?.querySelector("#btn_duong_di");
      if (btn) {
        // Bạn có thể thao tác nút này
        btn.textContent = "Xóa đường đi";
        const nearestLatLng = nearestMarker.getLatLng();
        btn.onclick = function () {
          toggleRoute(this, nearestLatLng.lat, nearestLatLng.lng);
        };
      }
    }, 100);
    


    // Hiển thị popup
    nearestMarker.openPopup();
  }

  
  function goToContribution(lat, lng, name, openingHours, address,shopType,image) {
    const url = `/map/dong-gop?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}&openingHours=${encodeURIComponent(openingHours)}&address=${encodeURIComponent(address)}&shopType=${encodeURIComponent(shopType)}&image=${encodeURIComponent(image)}`;
    window.location.href = url;
  }
  
  
  

  // Bắt sự kiện click trên bản đồ để lấy tọa độ
map.on('click', function(e) {
  const clickedLat = e.latlng.lat;
  const clickedLng = e.latlng.lng;
 // Nội dung popup gồm tọa độ và nút dẫn đến trang đóng góp
 const popupContent = `
 📍 Tọa độ:<br>
 Lat: ${clickedLat.toFixed(6)}<br>
 Lng: ${clickedLng.toFixed(6)}<br><br>
   <button  onclick="goToContribution(${clickedLat}, ${clickedLng}, '', '', '', '')" style="padding:5px 10px; background-color:#28a745; color:white; border:none; border-radius:4px; cursor:pointer;">
     Đóng góp thông tin
   </button>
`;
  // Hiển thị popup tại vị trí được nhấp
  L.popup()
    .setLatLng(e.latlng)
    .setContent(popupContent)
    .openOn(map);
});
