from django.urls import path
from . import views
app_name = 'map'
urlpatterns = [
    path('', views.map, name='map'),  # URL for the map view
    path("dong-gop", views.dong_gop_view, name="dong_gop"),
]