import json
from django.shortcuts import render, redirect
from backend.models import User
from django.http import JsonResponse


# Create your views here.


def home_page(request):
    if request.method == 'GET':
        return render(request, 'home.html')
    else:
        username = request.POST['username']
        password = request.POST['password']
        email = request.POST['email']


        #check to see whether email or username already exists
        if User.objects.filter(username = username).exists():
            error_message = 'This Username is taken'
            return render(request,'home.html',{'error_message':error_message})

        if email:
            if User.objects.filter(email = email).exists():
                error_message = 'this email is taken'
                return render(request,'home.html',{'error_message':error_message})
            new_user = User(username=username, password=password, email=email)
            new_user.save()
            return redirect('/signIn')

        else:
            new_user = User(username=username,password=password)
            new_user.save()
            return redirect('/signIn')

def sign_in(request):
    if request.method == 'GET':
        return render(request,'sign_in.html')
    else:

        post_content = json.loads(request.body)
        username = post_content['username']
        password = post_content['password']

        if User.objects.filter(username=username).exists():
            user = User.objects.filter(username=username)[0]

            if password == user.password:
                if user.schedule:
                    return JsonResponse(eval(user.schedule),safe=False)
                else:
                    return JsonResponse('None',safe=False)
            else:
                return JsonResponse('Incorrect password', safe=False)

        else:
            return JsonResponse('username does not exist', safe=False)
def update_user(request):
    if request.method == 'GET':
        return redirect('/signIn')
    else:
        post_content = json.loads(request.body)
        username = post_content['username']
        password = post_content['password']
        schedule = post_content['schedule']

        #shcedule is deserialized and its a dic, but when i save it, it becomes a string??
        #i think cause its a text field.yees thats why lmao
        print(schedule)
        print("--------------",schedule['notificationMap'])
        print(type(schedule))

        usertoUpdate = User.objects.filter(username=username)[0]

        usertoUpdate.schedule = schedule
        usertoUpdate.save()
        return JsonResponse('data pushed',safe=False)












