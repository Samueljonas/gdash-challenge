import time
import json
import requests
import schedule
import pika
from datetime import datetime
import os

 # PRODUCER



RABBITMQ_HOST = 'os.getenv("RABBITMQ_HOST", "localhost")'
QUEUE_NAME = 'weather_data'
CITY_LAT = '-9.4072'
CITY_LON = '-36.6275'

def fetch_weather():
    print(f'[{datetime.now()}] fetching weather data...')

    try:
        # Fetch weather data from Open-Meteo API using "requests" method
        url = f"https://api.open-meteo.com/v1/forecast?latitude={CITY_LAT}&longitude={CITY_LON}&current=temperature_2m,relative_humidity_2m,is_day,precipitation&timezone=auto"
        data = requests.get(url).json()
        #print(data)

        current = data.get('current', {})
        if not current:
            print("No current weather data found.")
            return
        payload = {
            "latitude": data.get('latitude'),
            "longitude": data.get('longitude'),
            "temperature": current.get('temperature_2m'),
            "humidity": current.get('relative_humidity_2m'),
            "is_day": current.get('is_day'),
            "precipitation": current.get('precipitation'),
            "timestamp": datetime.now().isoformat(),
        }

        publish_to_queue(payload)

    except Exception as e:
        print(f"Error fetching weather data: {e}")
# use pika to publish messages to RabbitMQ by AMQP protocol, throws every hour information about weather, creating a queue to go manage.
def publish_to_queue(payload):
    conection = pika.BlockingConnection(pika.ConnectionParameters(host=RABBITMQ_HOST))
    channel = conection.channel()

    channel.queue_declare(queue=QUEUE_NAME, durable=True)

    message = json.dumps(payload)
    channel.basic_publish(
        exchange='',
        routing_key=QUEUE_NAME,
        body=message,
        properties=pika.BasicProperties(
            delivery_mode=2,
        ))
    print(f" [x] Sent: {message}")
    conection.close()

if __name__ == '__main__':
    print('Starting weather data collector...')
    fetch_weather()  # Initial fetch

    schedule.every(0.2).hours.do(fetch_weather)

    while True: 
        schedule.run_pending()
        time.sleep(1)
