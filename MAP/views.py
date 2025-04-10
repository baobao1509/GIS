from django.shortcuts import render,redirect
from django.views.decorators.csrf import csrf_exempt
import csv
import os
from django.conf import settings
# Create your views here.
def map(request):
    return render(request, 'map.html')

@csrf_exempt
def dong_gop_view(request):
    if request.method == "POST":
        lat = request.POST.get("lat")
        lng = request.POST.get("lng")
        name = request.POST.get("name")
        openingHours = request.POST.get("openingHours")
        address = request.POST.get("address")
        # 👉 Lưu vào DB hoặc CSV (tùy bạn)
        print(f"Đóng góp: {name} tại ({lat}, {lng})")
        csv_file_path = os.path.join(settings.BASE_DIR, 'static', 'chuyen_doi_quan_cafe.csv')
        print(csv_file_path)
        rows = []
        found = False
        max_id = 0
        if os.path.exists(csv_file_path):
            with open(csv_file_path, mode='r', newline='', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    if row['lat'] == lat and row['lon'] == lng:
                        # ✅ Cập nhật dòng khớp
                        row['name'] = name or row['name']
                        row['thời gian mở cửa'] = openingHours or row['thời gian mở cửa']
                        row['địa chỉ'] = address or row['địa chỉ']
                        print("Cập nhật thông tin đóng góp")
                        found = True
                    rows.append(row)  # 🔥 PHẢI append lại dòng dù có cập nhật hay không
                    # Theo dõi max ID hiện có
                    try:
                        max_id = max(max_id, int(row['id']))
                    except:
                        pass
        else:
            # Nếu file chưa có, khởi tạo header
            rows = []
            header = ['id', 'lat', 'lon', 'name', 'shop_type', 'thời gian mở cửa', 'địa chỉ']

        if not found:
            # ✅ Thêm dòng mới nếu không trùng lat/lon
            new_row = {
                'id': str(max_id + 1),
                'lat': lat,
                'lon': lng,
                'name': name,
                'shop_type': 'supermarket',  # hoặc có thể để trống nếu không có
                'thời gian mở cửa': openingHours,
                'địa chỉ': address
            }
            rows.append(new_row)

        # Ghi lại toàn bộ file
        with open(csv_file_path, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=['id', 'lat', 'lon', 'name', 'shop_type', 'thời gian mở cửa', 'địa chỉ'])
            writer.writeheader()
            writer.writerows(rows)
        return render(request, "map.html")

    lat = request.GET.get("lat")
    lng = request.GET.get("lng")
    name = request.GET.get("name")
    openingHours = request.GET.get("openingHours")
    address= request.GET.get("address")
    return render(request, "dong_gop.html", {"lat": lat, "lng": lng, "name": name, "openingHours": openingHours, "address": address})