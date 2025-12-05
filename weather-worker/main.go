package main

import (
	"bytes"
	"os"
	"encoding/json"
	"io"
	"log"
	"net/http"


	amqp "github.com/rabbitmq/amqp091-go"
)

type WeatherData struct {
	Latitude      float64 `json:"latitude"`
	Longitude     float64 `json:"longitude"`
	Temperature   float64 `json:"temperature"`
	Humidity      float64 `json:"humidity"`
	IsDay         int     `json:"is_day"`
	Precipitation float64 `json:"precipitation"`
	Timestamp     string  `json:"timestamp"`
}
// Configuration from Environment Variables
var (
	RabbitMQURL = getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/")
	ApiUrl      = getEnv("API_URL", "http://localhost:3000/api/weather/logs")
	QueueName   = "weather_data"
)
// Helper function to get environment variables with fallback
func getEnv(key, fallback string) string{
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func main() {
	conn, err := amqp.Dial(RabbitMQURL)
	failOnError(err, "Failed to connect to RabbitMQ")
	defer conn.Close()

	ch, err := conn.Channel()
	failOnError(err, "Failed to open a channel")
	defer ch.Close()

	q, err := ch.QueueDeclare(
		QueueName,
		true,  // durable
		false, // delete when unused
		false, // exclusive
		false, // no-wait
		nil,   // arguments
	)
	failOnError(err, "Failed to declare a queue")

	msgs, err := ch.Consume(
		q.Name,
		"",    // consumer tag
		false, // auto-ack (IMPORTANT: false means we must manually Ack)
		false, // exclusive
		false, // no-local
		false, // no-wait
		nil,   // args
	)
	failOnError(err, "Failed to register a consumer")

	forever := make(chan struct{})

	go func() {
		for d := range msgs {
			log.Printf("Received a message:")
			var data WeatherData
			err := json.Unmarshal(d.Body, &data)
			if err != nil {
				log.Printf(" Error reading JSON: %s", err)
				// If parsing error, NACK without requeue
				// Requeue=false (discard message because it is invalid)
				d.Nack(false, false)
				continue
			}

			// Process (create HTTP POST to NestJS)
			success := sendToAPI(data)

			if success {
				log.Printf(" [Processed] Temp: %.1f°C | Humidity: %.1f%%", data.Temperature, data.Humidity)
				// ACK: "RabbitMQ, you can delete this message, I handled it."
				d.Ack(false)
			} else {
				log.Printf(" [API Failure] Retrying later...")
				// NACK: "RabbitMQ, I could not process this. Return to the queue for another attempt."
				// Requeue=true (send back to queue)
				d.Nack(false, true)
			}
		}
	}()

	log.Printf(" [*] Waiting for messages. To exit press CTRL+C")
	<-forever
}

// Helper function to send data to NestJS
func sendToAPI(data WeatherData) bool {
	jsonData, _ := json.Marshal(data)

	// Attempt to send
	resp, err := http.Post(ApiUrl, "application/json", bytes.NewBuffer(jsonData))

	// 1. Check for NETWORK error (Server down, wrong URL, no internet)
	if err != nil {
		log.Printf(" [API ERROR] : %s", err)
		return false
	}
	defer resp.Body.Close()

	// 2. Check if API responded with Success (200 or 201)
	if resp.StatusCode == 201 || resp.StatusCode == 200 {
		return true
	}

	// 3. If we got here, the API REJECTED (Error 400, 404, 500)
	// Let's read the response body to know the reason
	bodyBytes, _ := io.ReadAll(resp.Body)
	bodyString := string(bodyBytes)

	log.Printf(" [API ERROR] Status: %d | Reason: %s", resp.StatusCode, bodyString)

	return false
}

func failOnError(err error, msg string) {
	if err != nil {
		log.Panicf("%s: %s", msg, err)
	}
}