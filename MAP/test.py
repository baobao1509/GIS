import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "GIS.settings")
django.setup()

from .models import User  # nếu lỗi, đổi thành: from MAP.models import User

user = User(name='Nguyễn Văn A', username='nguyenvana', password='123456', phone='0123456789')
user.save()
print("Tạo user thành công!")
