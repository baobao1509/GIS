from django.urls import path
from . import views
app_name = 'map'
urlpatterns = [
    path('', views.map, name='map'),
    path("dong-gop", views.dong_gop_view, name="dong_gop"),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('home/', views.home, name='home'),

]