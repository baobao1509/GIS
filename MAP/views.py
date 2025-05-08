from django.shortcuts import render,redirect
from django.views.decorators.csrf import csrf_exempt
import csv
import os
from django.conf import settings
from .models import PasswordResetOTP
from .models import User
from django.contrib.auth.hashers import make_password, check_password
from .models import Info
from django.core.files.storage import FileSystemStorage
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Market
from .serializers import ShopSerializer  # Serializer để chuyển đổi dữ liệu từ model thành JSON
from django.http import JsonResponse
from .models import Rating
from django.views.decorators.csrf import csrf_exempt
import json
from django.db.models import Avg
from twilio.rest import Client
import random
from django.utils import timezone
from django.urls import reverse
import re

# def home(request):
#     print("Đã vào đây1")
#     user_id = request.session.get('id')
#     if not user_id:
#         return redirect('login')
#     user = User.objects.get(id=user_id)
#     print(user.username)
#     print(user.name)
#     return render(request, 'home.html')

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
        shopType = request.POST.get("shopType")
        old_image = request.POST.get("old_image_db")
        user_id = request.session.get('id')
        username = request.session.get('username', 'unknown')
         #Xử lý ảnh
        uploaded_image = request.FILES.get('image')
        image_path = NotImplementedError
        if uploaded_image:
            upload_dir = os.path.join(settings.BASE_DIR, 'static', 'anh')
            fs = FileSystemStorage(location=upload_dir)
            filename = fs.save(uploaded_image.name, uploaded_image)
            image_path = os.path.join('static', 'anh', filename)
        else:
            image_path = old_image  
        #Lưu vào DB 
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
                time=openingHours,
                address=address,
                shop_type=shopType,
                username=username,
                userid=user_id,
                image=image_path,
                old_image=old_image
            )
        return redirect('/map/')
        
    user_id = request.session.get('id')
    if(user_id):
        lat = request.GET.get("lat")
        lng = request.GET.get("lng")
        name = request.GET.get("name")
        openingHours = request.GET.get("openingHours")
        address= request.GET.get("address")
        shopType= request.GET.get("shopType")
        image= request.GET.get("image")
        return render(request, "dong_gop.html", {"lat": lat, "lng": lng, "name": name, "openingHours": openingHours, "address": address, "shopType": shopType, "image": image})
    else:
        return redirect('login')


def register_view(request):
    if request.method == 'POST':
        name = request.POST['name']
        username = request.POST['username']
        phone = request.POST['phone']
        password = request.POST['password']
        confirm_password = request.POST['confirm_password']
        # kiểm tra tài khoản đã tồn tại chưa
        if User.objects.filter(username=username).exists():
            return render(request, 'register.html', {'error': 'Tài khoản đã tồn tại'}) 
        # kiểm tra số điện thoại đã tồn tại chưa
        if User.objects.filter(phone=phone).exists():
            return render(request, 'register.html', {'error': 'Số điện thoại đã tồn tại'}) 
        # Kiểm tra mật khẩu khớp nhau
        if password != confirm_password:
            return render(request, 'register.html', {'error': 'Mật khẩu không khớp'})
         # Kiểm tra độ dài mật khẩu
        if len(password) < 9:
            return render(request, 'register.html', {'error': 'Mật khẩu phải có ít nhất 9 ký tự'})

        # Kiểm tra mật khẩu có chứa ít nhất một chữ cái
        if not re.search(r'[A-Za-z]', password):
            return render(request, 'register.html', {'error': 'Mật khẩu phải chứa ít nhất một chữ cái'})
        hashed_password = make_password(password)
        User.objects.create(name=name, username=username, phone=phone, password=hashed_password)
        return redirect('login')  # Chuyển hướng sang trang đăng nhập
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


class ShopListView(APIView):
    def get(self, request):
        shops = Market.objects.all()  # Lấy tất cả cửa hàng từ cơ sở dữ liệu
        shop_data = []
        for shop in shops:
            # Tính toán đánh giá trung bình
            avg_rating = round(shop.ratings.aggregate(Avg('stars'))['stars__avg'] or 0, 1)
            # Sử dụng serializer để chuyển đổi dữ liệu cửa hàng thành định dạng JSON
            shop_info = ShopSerializer(shop).data
            # Thêm thông tin đánh giá trung bình vào dữ liệu trả về
            shop_info['avg_rating'] = avg_rating
            shop_data.append(shop_info)
        return Response(shop_data, status=status.HTTP_200_OK)


def submit_rating(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        lat = data.get('lat')
        lon = data.get('lon')
        stars = data.get('stars')
        comment = data.get('comment', '')
        user_id = data.get('user_id')
        if not lat or not lon or not stars or not user_id:
            return JsonResponse({'error': 'Thiếu dữ liệu'}, status=400)
        try:
            market = Market.objects.get(lat=lat, long=lon)
            user = User.objects.get(id=user_id)
        except (Market.DoesNotExist, User.DoesNotExist):
            return JsonResponse({'error': 'Không tìm thấy market hoặc user'}, status=404)
        Rating.objects.create(
            market=market,
            stars=stars,
            comment=comment,
            user=user
        )
        avg = round(market.ratings.aggregate(Avg('stars'))['stars__avg'], 1)
        return JsonResponse({'new_average': avg})
   










    
class RatingListView(APIView):
    def get(self, request):
        lat = request.query_params.get('lat')
        lon = request.query_params.get('lon')
        if not lat or not lon:
            return Response({"error": "Thiếu tọa độ"}, status=400)
        try:
            market = Market.objects.get(lat=lat, long=lon)
        except Market.DoesNotExist:
            return Response({"error": "Không tìm thấy market"}, status=404)
        ratings = market.ratings.all().order_by('-created_at')
        data = [
            {
                "stars": r.stars,
                "comment": r.comment,
                "user": r.user.name if r.user else "Ẩn danh",
                "created_at": r.created_at.strftime("%Y-%m-%d %H:%M")
            }
            for r in ratings
        ]
        return Response(data, status=200)
    




    #Quên mật khẩu 
def forgot_password_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        phone = request.POST.get('phone')
        try:
            user = User.objects.get(username=username, phone=phone)
        except User.DoesNotExist:
            return render(request, 'forgot_password.html', {'error': 'Tài khoản hoặc số điện thoại không đúng!'})
        if(user):
            return redirect(f"{reverse('map:verify_otp')}?phone={phone}&username={username}&id={user.id}")
    return render(request, 'forgot_password.html')
       
def verify_otp_view(request):
    phone = request.GET.get('phone')
    username = request.GET.get('username')
    user_id = request.GET.get('id')
    if request.method == 'POST':
        new_password = request.POST.get('new_password')
        confirm_password = request.POST.get('re_password')
        print(new_password)
        print(confirm_password)
        # Kiểm tra mật khẩu khớp nhau
        if new_password != confirm_password:
            return render(request, 'verify_otp.html', {'error': 'Mật khẩu không khớp'})
        hashed_password = make_password(new_password)
        try:
            user = User.objects.get(id=user_id, phone=phone, username=username)
            user.password = hashed_password  # gán thẳng
            user.save()
            return redirect('/login/')
        except User.DoesNotExist:
            return render(request, 'verify_otp.html', {'error': 'Thông tin không hợp lệ.', 'phone': phone, 'username': username, 'id': user_id})

    return render(request, 'verify_otp.html')