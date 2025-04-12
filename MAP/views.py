from django.shortcuts import render,redirect
from django.views.decorators.csrf import csrf_exempt
import csv
import os
from django.conf import settings
from .models import User
from django.contrib.auth.hashers import make_password, check_password
from .models import Info
from django.core.files.storage import FileSystemStorage
# Create your views here.
def home(request):
    print("Đã vào đây")
    user_id = request.session.get('id')
    if not user_id:
        return redirect('login')
    user = User.objects.get(id=user_id)
    print(user.username)
    print(user.name)
    return render(request, 'home.html')
# Create your views here.
def map(request):
    is_logged_in = False
    user = None
    user_id = request.session.get('id')
    if not user_id:
        print("Không có user_id trong session")
    if user_id:
         try:
            user = User.objects.get(id=user_id)
            is_logged_in = True
            print(user.username)
            print(user.name)
         except User.DoesNotExist:
            print("Không tìm thấy user")
            
            
    context = {'is_logged_in': is_logged_in}
    if user:
         context.update({
        'username': user.username,
        'name': user.name,
        'id': user.id,
        'phone': user.phone,
    })
    return render(request, 'map.html', context)

@csrf_exempt
def dong_gop_view(request):
    if request.method == "POST":
        lat = request.POST.get("lat")
        lng = request.POST.get("lng")
        name = request.POST.get("name")
        openingHours = request.POST.get("openingHours")
        address = request.POST.get("address")
        user_id = request.session.get('id')
        username = request.session.get('username', 'unknown')
         # 👉 Xử lý ảnh
        uploaded_image = request.FILES.get('image')
        image_path = NotImplementedError
        if uploaded_image:
            # Đường dẫn tuyệt đối đến static/leaflet/anh
            upload_dir = os.path.join(settings.BASE_DIR, 'static', 'anh')
            fs = FileSystemStorage(location=upload_dir)
            filename = fs.save(uploaded_image.name, uploaded_image)
            # Đường dẫn tương đối để sử dụng trong template (nếu cần)
            image_path = os.path.join('static', 'anh', filename)
        # 👉 Lưu vào DB hoặc CSV (tùy bạn)
        print(f"Đóng góp: {name} tại ({lat}, {lng})")
        csv_file_path = os.path.join(settings.BASE_DIR, 'static', 'chuyen_doi_quan_cafe.csv')
        found = False
        max_id = 0
        if os.path.exists(csv_file_path):
            with open(csv_file_path, mode='r', newline='', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    if row['lat'] == lat and row['lon'] == lng:
                        found = True
                        break
                    try:
                        max_id = max(max_id, int(row['id']))
                    except:
                        pass
        Info.objects.create(
                lat=lat,
                lng=lng,
                name=name,
                shop_type='supermarket',
                time=openingHours,
                address=address,
                username=username,
                userid=user_id,
                image=image_path  # cần model Info có field image
            )
        print("✅ Đã lưu vào database.")
        return redirect('/map/')
        
    user_id = request.session.get('id')
    if(user_id):
        lat = request.GET.get("lat")
        lng = request.GET.get("lng")
        name = request.GET.get("name")
        openingHours = request.GET.get("openingHours")
        address= request.GET.get("address")
        return render(request, "dong_gop.html", {"lat": lat, "lng": lng, "name": name, "openingHours": openingHours, "address": address})
    else:
        return redirect('login')


def register_view(request):
    if request.method == 'POST':
        name = request.POST['name']
        username = request.POST['username']
        phone = request.POST['phone']
        password = make_password(request.POST['password'])
        
        # kiểm tra tài khoản đã tồn tại chưa
        if User.objects.filter(username=username).exists():
            return render(request, 'register.html', {'error': 'Tài khoản đã tồn tại'})
        
        User.objects.create(name=name, username=username, phone=phone, password=password)
        return redirect('login/')
    
    return render(request, 'register.html')


def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        try:
            user = User.objects.get(username=username)
            if check_password(password, user.password):
                request.session['id'] = user.id
                request.session['name'] = user.name
                request.session['username'] = user.username
                request.session['phone'] = user.phone
                return redirect('/')
            else:
                return render(request, 'login.html', {'error': 'Sai mật khẩu'})
        except User.DoesNotExist:
            return render(request, 'login.html', {'error': 'Tài khoản không tồn tại'})

    return render(request, 'login.html')