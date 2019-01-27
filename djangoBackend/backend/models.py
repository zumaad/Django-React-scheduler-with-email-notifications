from django.db import models


# Create your models here.

class User(models.Model):
    username = models.CharField(max_length=45)
    password = models.TextField(max_length=300)
    email = models.CharField(max_length=100,blank=True)
    schedule = models.TextField(blank=True)
