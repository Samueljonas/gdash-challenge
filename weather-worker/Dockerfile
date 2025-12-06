# Step 1: Compilation
FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o worker main.go

# Step 2: Execution (Clean image)
FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/worker .
CMD ["./worker"]