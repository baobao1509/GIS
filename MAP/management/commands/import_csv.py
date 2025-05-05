import csv
from django.core.management.base import BaseCommand
from ...models import Market

class Command(BaseCommand):
    help = 'Import CSV data into QuanCafe model'

    def add_arguments(self, parser):
        parser.add_argument('csv_file', type=str)
    def handle(self, *args, **kwargs):
        csv_file = kwargs['csv_file']
        with open(csv_file, newline='', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                Market.objects.create(
                    name=row['name'],
                    address=row['địa chỉ'],
                    shopType=row['shop_type'],
                    time=row['thời gian mở cửa'],
                    lat=float(row['lat']),
                    long=float(row['lon']),
                    imageURL=row['image']
                )
        self.stdout.write(self.style.SUCCESS('Data imported successfully'))
