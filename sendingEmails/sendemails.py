import smtplib, ssl
import mysql.connector
import datetime
import dateutil.parser
import pytz
import time
from pytz import timezone
from util_func import compare_time
from hidden import db_host,db_pass,db_user,schema_name,sender_email,password

timezone = 'America/New_York'

# Quick summary: I connect to the mySQL db where the notification maps are stored after the 
#user indicates when they want to be notified. After I connect, I retrieve it, parse the dates
# and send the notifications when the time is greater than the parsed time. Then, I clean
#the notification map of already sent emails and save it in the db to ensure I won't send the same
#emails again.

#given a notification_map and a task_name, it deletes the notification entry from
#the notification map so that repeated emails aren't send for the same task.
def deleteNotification(user_id,task_name,notification_map,schedule):
    cnx = mysql.connector.connect(user=db_user, password=db_pass,
                                host=db_host,
                                database=schema_name)
    cursor = cnx.cursor(buffered=True)
    copied_notification_map = notification_map.copy()
    del copied_notification_map[task_name]
    changed_schedule = eval(schedule)
    changed_schedule['notificationMap'] = copied_notification_map
    query = ('Update backend_user Set schedule = ' + "\"" + str(changed_schedule)+ "\"" + ' where id =' + str(user_id) + ';')
    cursor.execute(query)
    cnx.commit()
    cnx.close()

def get_data_send_email():
    cnx = mysql.connector.connect(user=db_user, password=db_pass,
                                host=db_host,
                                database=schema_name)
    cursor = cnx.cursor()
    query = ("SELECT * FROM scheduler.backend_user;")
    cursor.execute(query)
    rows = cursor.fetchall()
    #this gets you a tuple representing a row
    for user in rows:
        email = user[3]
        user_id = user[0]
        schedule = user[4]
        notification_map = eval(schedule)['notificationMap']
        
        for task_name,dates in notification_map.items():
            date = dateutil.parser.parse(dates['date'])
            hour_minutes = dateutil.parser.parse(dates['hour'])
            combined_notification_date = date.replace(hour = hour_minutes.hour,minute = hour_minutes.minute)
            tz = pytz.timezone(timezone) 
            current_time = datetime.datetime.now(tz)
            if compare_time(current_time,combined_notification_date):
                print('sending notification')
                send_email(email,task_name)
                cnx.close()
                deleteNotification(user_id,task_name,notification_map,schedule)
    
def send_email(email_adress,task_name):
    port = 465  
    smtp_server = "smtp.gmail.com"
    sender_email = username
    receiver_email = email_adress 
    password = password
    message = 'Subject: This is a reminder to work on ' + task_name
    context = ssl.create_default_context()

    
    with smtplib.SMTP_SSL(smtp_server, port, context=context) as server:
        server.login(sender_email, password)
        server.sendmail(sender_email, receiver_email, message)

def main():
    while True:
        get_data_send_email()
        time.sleep(60)

main()





