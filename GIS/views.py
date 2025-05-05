from django.shortcuts import render,redirect

from MAP.models import User
# Create your views here.
def home(request):
     print("Đã vào đây2")
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
     return render(request, 'home.html', context)


def logout_view(request):
    request.session.flush()
    return redirect('home')  