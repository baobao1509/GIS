from django.db import models
from django.contrib.auth.hashers import make_password
class User(models.Model):
    name = models.CharField(max_length=100)
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=128)
    phone = models.CharField(max_length=12)
    def save(self, *args, **kwargs):
        # Nếu mật khẩu chưa được hash thì hash nó
        if not self.password.startswith('pbkdf2_'):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)
    def __str__(self):
        return self.name


class Info(models.Model):
    lat = models.CharField(max_length=100)
    lng = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    shop_type = models.CharField(max_length=100)
    time = models.CharField(max_length=100)
    address = models.CharField(max_length=100)
    username = models.CharField(max_length=100, null=True, blank=True)
    userid = models.CharField(max_length=100, null=True, blank=True)
    old_image = models.CharField(max_length=300, null=True, blank=True)
    image = models.CharField(max_length=300, null=True, blank=True)
    type_contribution = models.IntegerField(null=True, blank=True)
    def __str__(self):
        return self.name

class Market(models.Model):
    name = models.CharField(max_length=255)
    address = models.TextField()
    shopType=models.TextField()
    time=models.TextField()
    lat = models.FloatField()
    long = models.FloatField()
    imageURL = models.TextField()
    def __str__(self):
        return self.name
    
class Rating(models.Model):
    market = models.ForeignKey(Market, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='ratings', null=True)
    stars = models.PositiveSmallIntegerField()  # từ 1 đến 5
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.market.name} - {self.stars}⭐"
    
    
class PasswordResetOTP(models.Model):
    phone_number = models.CharField(max_length=15)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
