import uuid
import random
from decimal import Decimal
from django.core.management.base import BaseCommand
from inventory.models import Product

class Command(BaseCommand):
    help = 'Generates 10 random products for testing'

    def handle(self, *args, **kwargs):
        products_to_create = []
        
        # Sample data for generation
        names = ["Laptop", "Smartphone", "Headphones", "Monitor", "Keyboard", "Mouse", "Tablet", "Camera", "Speaker", "Printer"]
        adjectives = ["Pro", "Ultra", "Lite", "Classic", "Gaming", "Wireless"]

        self.stdout.write("Generating products...")

        for i in range(10):
            # Pick a random name combo
            name = f"{random.choice(names)} {random.choice(adjectives)} {i+1}"
            
            # Generate a random price between 10.00 and 999.99
            price = Decimal(random.randrange(1000, 99999)) / 100
            
            product = Product(
                id=uuid.uuid4(),
                product_name=name,
                product_price=price,
                product_description=f"This is a high-quality description for the {name}. Ideal for daily use."
            )
            products_to_create.append(product)

        # Bulk create is much faster than individual .save() calls
        Product.objects.bulk_create(products_to_create)

        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(products_to_create)} products!'))