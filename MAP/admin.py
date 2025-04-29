from django.contrib import admin
from django.utils.html import format_html
from .models import Info
from .models import User
import csv
import os
from django.conf import settings
from django.urls import path
from django.shortcuts import redirect, get_object_or_404
from django.templatetags.static import static
admin.site.register(User)

@admin.register(Info)
class InfoAdmin(admin.ModelAdmin):
    list_display = ('name', 'lat', 'lng', 'shop_type', 'time', 'address', 'username', 'userid','image_tag','action_buttons')

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('accept/<int:info_id>/', self.admin_site.admin_view(self.accept_info), name='accept_info'),
            path('reject/<int:info_id>/', self.admin_site.admin_view(self.reject_info), name='reject_info'),
        ]
        return custom_urls + urls
    def image_tag(self, obj):
        if obj.image:
            # Đảm bảo đường dẫn tĩnh đúng (Django hiểu)
            image_path = obj.image.replace('\\', '/')  # tránh lỗi khi lưu ảnh từ Windows
            image_url = static(image_path.replace('static/', ''))  # loại bỏ 'static/' vì static() sẽ thêm lại
            return format_html(
                '<img src="{}" width="100" style="object-fit: contain; border: 1px solid #ccc; border-radius: 6px;" />',
                image_url
            )
        return "Không có ảnh"
    image_tag.short_description = 'Hình ảnh'
    def action_buttons(self, obj):
        return format_html(
            '<a class="button" style="color:lightgreen;" href="{}">✅</a>&nbsp;'
            '<a class="button" style="color:red;" href="{}">❌</a>',
            f'accept/{obj.id}/',
            f'reject/{obj.id}/'
        )
    action_buttons.short_description = 'Thao tác'


    def accept_info(self, request, info_id):
        obj = get_object_or_404(Info, pk=info_id)
        csv_path = os.path.join(settings.BASE_DIR, 'static', 'chuyen_doi_quan_cafe.csv')
        fieldnames = ['id', 'lat', 'lon', 'name', 'shop_type', 'thời gian mở cửa', 'địa chỉ', 'image']
        rows = []
        updated = False
        # Đọc tất cả các dòng hiện có trong CSV
        if os.path.exists(csv_path):
            with open(csv_path, mode='r', newline='', encoding='utf-8') as file:
                reader = csv.DictReader(file)
                for row in reader:
                    if row['lat'] == str(obj.lat) and row['lon'] == str(obj.lng):
                        # Cập nhật dòng nếu trùng tọa độ
                        row = {
                            'id': obj.id,
                            'lat': obj.lat,
                            'lon': obj.lng,
                            'name': obj.name,
                            'shop_type': obj.shop_type,
                            'thời gian mở cửa': obj.time,
                            'địa chỉ': obj.address,
                            'image': obj.image
                        }
                        updated = True
                    # Đảm bảo mỗi dòng chỉ chứa các field hợp lệ
                    rows.append({key: row.get(key, '') for key in fieldnames})
        # Nếu chưa có thì thêm mới
        if not updated:
            rows.append({
                'id': obj.id,
                'lat': obj.lat,
                'lon': obj.lng,
                'name': obj.name,
                'shop_type': obj.shop_type,
                'thời gian mở cửa': obj.time,
                'địa chỉ': obj.address,
                'image': obj.image
            })

        # Ghi lại toàn bộ file CSV
        with open(csv_path, mode='w', newline='', encoding='utf-8') as file:
            writer = csv.DictWriter(file, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        if obj.old_image and obj.old_image.strip():
            if obj.image != obj.old_image:
                old_image_path = os.path.join(settings.BASE_DIR, obj.old_image.replace('/', os.sep))
                if os.path.isfile(old_image_path):
                    os.remove(old_image_path)
        # Xóa bản ghi trong database
        obj.delete()
        self.message_user(request, f"✅ Đã {'cập nhật' if updated else 'thêm mới'}: {obj.name}")
        return redirect(request.META.get('HTTP_REFERER', '/admin/'))



    def reject_info(self, request, info_id):
        obj = get_object_or_404(Info, pk=info_id) # Xóa file ảnh nếu tồn tại
        if obj.image:
            image_path = obj.image
            if os.path.isfile(image_path):
                os.remove(image_path)
        obj.delete()
        self.message_user(request, f"❌ Đã xóa: {obj.name}")
        return redirect(request.META.get('HTTP_REFERER', '/admin/'))
