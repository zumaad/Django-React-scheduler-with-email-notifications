# Generated by Django 2.1.5 on 2019-01-09 05:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('backend', '0004_auto_20190109_0458'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='schedule',
            field=models.TextField(blank=True),
        ),
    ]
