# Generated by Django 5.1.4 on 2024-12-07 12:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='transactions',
            name='Discount_FK',
        ),
        migrations.RemoveField(
            model_name='transactions',
            name='Payment_FK',
        ),
    ]
