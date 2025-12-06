# Lightweight Python base image
FROM python:3.10-slim

# Create working directory
WORKDIR /app

# Install dependencies
# (Tip: Create requirements.txt if you don't have one: pip freeze > requirements.txt)
# To make it easier, I'll install it directly here in the command to ensure:
RUN pip install requests pika schedule

# Copy the code
COPY . .

# Command to run
CMD ["python", "main.py"]