from django.urls import path
from . import views
app_name = 'map'
urlpatterns = [
    path('', views.map, name='map'),
    path("dong-gop", views.dong_gop_view, name="dong_gop"),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('api/rating/submit/', views.submit_rating, name='submit_rating'),
    path('api/shops/', views.ShopListView.as_view(), name='shop-list'),
    path('api/shops/', views.ShopListView.as_view(), name='shop-list'),
    path('api/rating/list/', views.RatingListView.as_view(), name='rating-list'),
    path('forgot-password/', views.forgot_password_view, name='forgot_password'),
    path('verify-otp/', views.verify_otp_view, name='verify_otp'),
]