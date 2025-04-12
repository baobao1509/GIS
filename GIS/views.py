from django.shortcuts import render,redirect

from MAP.models import User
# Create your views here.
def home(request):
     print("Đã vào đây")
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
     return render(request, 'home.html', context)


def logout_view(request):
    # Xóa toàn bộ session
    request.session.flush()
    
    # Có thể thêm thông báo nếu muốn (tuỳ bạn)
    # messages.info(request, "Bạn đã đăng xuất.")

    # Chuyển hướng về trang chủ (hoặc trang login)
    return redirect('home')  # Đảm bảo 'home' là tên của route trang chủ