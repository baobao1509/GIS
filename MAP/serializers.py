# serializers.py
from rest_framework import serializers
from .models import Market

class ShopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Market
        fields = ['name', 'lat', 'long', 'shopType', 'time', 'address', 'imageURL']
