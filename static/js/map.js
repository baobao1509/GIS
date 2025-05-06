
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


// Tạo icon cho siêu thị và chợ
const supermarketIcon = L.icon({
  iconUrl: "/static/leaflet/images/supermarket.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32] //[0, -32] nghĩa là popup sẽ xuất hiện
});

const marketIcon = L.icon({
  iconUrl: "/static/leaflet/images/market.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32] //[0, -32] nghĩa là popup sẽ xuất hiện
});




// function submitRating(lat, lon, stars) {
//   fetch('/map/api/rating/submit/', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'X-CSRFToken': getCSRFToken() // nếu cần
//     },
//     body: JSON.stringify({ lat: lat, lon: lon, stars: stars })
//   })
//     .then(response => response.json())
//     .then(data => {
//       alert(`Cảm ơn bạn đã đánh giá ${stars} sao!`);
//       document.getElementById(`avg-rating-${lat}-${lon}`).textContent = data.new_average;
//     })
//     .catch(err => console.error("Lỗi đánh giá:", err));
// }


//HEREEEEEEEEEEEEEEEEEEEEEEEEE
function getCSRFToken() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}


let selectedLat = null;
let selectedLon = null;
let selectedStars = 0;

function openRatingModal(lat, lon, name) {
  selectedLat = lat;
  selectedLon = lon;
  selectedStars = 0;
  document.getElementById("modalShopName").textContent = `Đánh giá cho: ${name}`;
  document.getElementById("ratingComment").value = '';
  updateStarsUI();
  document.getElementById("ratingModal").style.display = "flex";
  // Load các đánh giá hiện có
  fetch(`/map/api/rating/list/?lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("ratingList");
      if (data.length === 0) {
        container.innerHTML = "<i>Chưa có đánh giá nào.</i>";
      } else {
        container.innerHTML = data.map(r => `
          <div style="border-bottom: 1px solid #ddd; padding: 8px 0;">
            <div style="font-size: 16px; margin-bottom: 4px;">
              <strong>${r.stars} ⭐</strong> 
              <span style="color: #555; font-size: 13px;">(by ${r.user})</span>
              <span style="color: #999; font-size: 12px; float: right;">${r.created_at}</span>
            </div>
            <div style="font-size: 14px; color: #333;">${r.comment || "<i style='color:#888;'>Không có bình luận</i>"}</div>
          </div>
        `).join('');
      }
    });
}

function closeRatingModal() {
  document.getElementById("ratingModal").style.display = "none";
}

function selectStar(star) {
  selectedStars = star;
  updateStarsUI();
}

function updateStarsUI() {
  const starContainer = document.getElementById("modalStars");
  starContainer.innerHTML = [1, 2, 3, 4, 5].map(star => `
    <span onclick="selectStar(${star})" style="cursor:pointer; color: ${star <= selectedStars ? '#ffc107' : '#ccc'};">
      ${star <= selectedStars ? '★' : '☆'}
    </span>
  `).join('');
}

function loadRatings(lat, lon) {
  fetch(`/map/api/rating/list/?lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("ratingList");
      if (data.length === 0) {
        container.innerHTML = "<i>Chưa có đánh giá nào.</i>";
      } else {
        container.innerHTML = data.map(r => `
          <div style="border-bottom: 1px solid #ddd; padding: 8px 0;">
            <div style="font-size: 16px; margin-bottom: 4px;">
              <strong>${r.stars} ⭐</strong> 
              <span style="color: #555; font-size: 13px;">(by ${r.user})</span>
              <span style="color: #999; font-size: 12px; float: right;">${r.created_at}</span>
            </div>
            <div style="font-size: 14px; color: #333;">${r.comment || "<i style='color:#888;'>Không có bình luận</i>"}</div>
          </div>
        `).join('');
      }
    });
}

function submitDetailedRating() {
  const comment = document.getElementById("ratingComment").value;
  // Kiểm tra đăng nhập trước khi gửi
  if (!currentUserId) {
    alert("Bạn cần đăng nhập để đánh giá.");
    window.location.href = '/login/';
    return;
  }
  fetch('/map/api/rating/submit/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCSRFToken()
    },
    body: JSON.stringify({
      lat: selectedLat,
      lon: selectedLon,
      stars: selectedStars,
      comment: comment,
      user_id: currentUserId   // truyền id người dùng đang đăng nhập
    })
  })
    .then(res => res.json())
    .then(data => {
      alert("Cảm ơn bạn đã đánh giá!"); 
      loadRatings(selectedLat, selectedLon); // Load lại danh sách đánh giá
      // Cập nhật lại số sao trung bình trong popup (nếu đang mở popup)
      const avgRatingElement = document.getElementById(`avg-rating-${selectedLat}-${selectedLon}`);
      if (avgRatingElement) {
        avgRatingElement.innerText = data.new_average;
      }
      document.getElementById("ratingComment").value = ''; // Reset ô comment
      selectedStars = 0; 
      updateStarsUI(); // Reset UI số sao
    })
    .catch(err => console.error("Lỗi gửi đánh giá:", err));
}
//HEREEEEEEEEEEEEEEEEEEEEEEEEEEEEE












const shopMarkers = []; // lưu các marker chợ/siêu thị
let shopsVisible = false;

const marketMarkers = [];
let marketsVisible = false;

const supermarketMarkers = [];
let supermarketsVisible = false;
function isValidCoordinate(value) {
  return value !== null && value !== '' && !isNaN(parseFloat(value));
}
function escapeString(str) {
  return String(str)
    .replace(/\\/g, '\\\\')           // Escape backslash
    .replace(/'/g, "\\'")             // Escape dấu nháy đơn
    .replace(/"/g, '')                // Escape dấu nháy kép
    .replace(/\n/g, ' ')              // Thay thế xuống dòng
    .replace(/\r/g, ' ')              // Thay thế carriage return
    .replace(/\u2028/g, '\\u2028')    // Escape line separator
    .replace(/\u2029/g, '\\u2029')    // Escape paragraph separator
    .replace(/</g, '&lt;')            // Chống XSS
    .replace(/>/g, '&gt;');           // Chống XSS
}

window.addEventListener('DOMContentLoaded', () => {
  fetch(`/map/api/shops/`) // Thay thế URL bằng API bạn đã tạo
    .then((response) => response.json()) // Nhận dữ liệu JSON từ API
    .then((shops) => { // Dữ liệu trả về từ API
      shops.forEach((shop) => {
        let lat = parseFloat(shop.lat);
        let lon = parseFloat(shop.long);
        let name = shop.name || "Không rõ";
        let shopType = shop.shopType || "Không xác định";
        let openingHours = shop.time || "Không có thông tin";
        let address = shop.address || "Chưa được cập nhật";
        let image = shop.imageURL || "Chưa được cập nhật";
        let avgRating = shop.avg_rating || 0;  // Lấy giá trị đánh giá trung bình từ API
        image = image.replace(/\\/g, "/");

        if (!isNaN(lat) && !isNaN(lon)) {
          let icon, targetArray;
          if (shopType.toLowerCase().includes("supermarket")) {
            icon = supermarketIcon;
            targetArray = supermarketMarkers;
          } else {
            icon = marketIcon;
            targetArray = marketMarkers;
          }

          let popupContent = `
            <div style="font-family: Arial, sans-serif; max-width: 250px;">
              <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${name}</h3>
              <p style="margin: 4px 0;"><strong>Loại:</strong> ${shopType}</p>
              <p style="margin: 4px 0;"><strong>Giờ mở cửa:</strong> ${openingHours}</p>
              <p style="margin: 4px 0;"><strong>Địa chỉ:</strong> ${address}</p>
              <img src="/${image}" alt="Hình ảnh" style="width: 100%; height: auto; border-radius: 6px; margin: 10px 0;">
              <div style="margin: 8px 0;">
                <strong>Đánh giá trung bình:</strong> 
                <span id="avg-rating-${lat}-${lon}">${avgRating}</span> ⭐
              </div>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <button onclick="toggleRoute(this, ${lat}, ${lon})" id="btn_duong_di" style="background-color: #007bff; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                  Xem đường đi
                </button>
                <button onclick="goToContribution(${lat}, ${lon}, '${escapeString(name)}', '${escapeString(openingHours)}', '${escapeString(address)}', '${escapeString(shopType)}', '${escapeString(image)}')" style="background-color: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                  Đóng góp
                </button>
                  <button 
                    onclick="openRatingModal(${lat}, ${lon}, '${escapeString(name)}')" 
                    style=" background-color: #ffc107; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">
                    Chi tiết đánh giá
                  </button>

              </div>
            </div>
          `;
          let marker = L.marker([lat, lon], { icon: icon }).bindPopup(popupContent);
          shopMarkers.push(marker);
          targetArray.push(marker);
        }
      });
    })
    .catch((error) => console.error("Lỗi khi tải dữ liệu:", error));
});




const routeBtn = document.getElementById("btn_duong_di");
// Hàm hiển thị/ẩn chợ và siêu thị
function toggleShopsAndMarkets() {
  const button = document.getElementById("toggleMarkersBtn");
  if (shopsVisible) {
    console.log("đang ẩn");
    // Ẩn các marker chợ và siêu thị
    shopMarkers.forEach(marker => map.removeLayer(marker));
    button.textContent = "Hiển thị chợ và siêu thị";
    // Đổi nút hiển thị/ẩn chợ và siêu thị
    const toggleMarketButton = document.getElementById("toggleMarketsBtn");
    const toggleSupermarketButton = document.getElementById("toggleSupermarketsBtn");
    toggleMarketButton.textContent = "Hiển thị chợ";
    toggleSupermarketButton.textContent = "Hiển thị siêu thị";
    // Xóa đường đi nếu có
    if (routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }

  } else {
    console.log("đang hiển thị");
    // Hiển thị lại các marker chợ và siêu thị
    shopMarkers.forEach(marker => marker.addTo(map));
    button.textContent = "Ẩn chợ và siêu thị";

    // Đổi nút hiển thị/ẩn chợ và siêu thị
    const toggleMarketButton = document.getElementById("toggleMarketsBtn");
    const toggleSupermarketButton = document.getElementById("toggleSupermarketsBtn");

    marketsVisible = !marketsVisible;
    supermarketsVisible = !supermarketsVisible;
    toggleMarketButton.textContent = "Ẩn chợ";
    toggleSupermarketButton.textContent = "Ẩn siêu thị";
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
    const marker = L.marker([e.latitude, e.longitude], { icon: userIcon }).addTo(map)
      .bindPopup("Vị trí hiện tại của bạn");
    // Thêm marker và circle vào bản đồ
    map.addLayer(marker);
  })

  // Nếu có lỗi (ví dụ người dùng từ chối chia sẻ vị trí)
  .on("locationerror", (e) => {
    alert("Không thể lấy vị trí của bạn: ");
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
      routeWhileDragging: false,// Không cho phép kéo tuyến đường bằng chuột.
      show: true,//Hiển thị tuyến đường khi vừa tạo.
      addWaypoints: false,// Không cho phép thêm các waypoint trung gian bằng cách click vào tuyến đường.
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


function goToContribution(lat, lng, name, openingHours, address, shopType, image) {
  const url = `/map/dong-gop?lat=${lat}&lng=${lng}&name=${encodeURIComponent(name)}&openingHours=${encodeURIComponent(openingHours)}&address=${encodeURIComponent(address)}&shopType=${encodeURIComponent(shopType)}&image=${encodeURIComponent(image)}`;
  window.location.href = url;
}




// Bắt sự kiện click trên bản đồ để lấy tọa độ
map.on('click', function (e) {
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











function toggleMarkets() {
  const button = document.getElementById("toggleMarketsBtn");
  if (marketsVisible) {
    marketMarkers.forEach(marker => map.removeLayer(marker));
    button.textContent = "Hiển thị chợ";
    if (!supermarketsVisible && routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }
  } else {
    marketMarkers.forEach(marker => marker.addTo(map));
    button.textContent = "Ẩn chợ";
  }
  marketsVisible = !marketsVisible;
}

function toggleSupermarkets() {
  const button = document.getElementById("toggleSupermarketsBtn");
  if (supermarketsVisible) {
    supermarketMarkers.forEach(marker => map.removeLayer(marker));
    button.textContent = "Hiển thị siêu thị";
    if (!marketsVisible && routeControl) {
      map.removeControl(routeControl);
      routeControl = null;
    }
  } else {
    supermarketMarkers.forEach(marker => marker.addTo(map));
    button.textContent = "Ẩn siêu thị";
  }
  supermarketsVisible = !supermarketsVisible;
}


