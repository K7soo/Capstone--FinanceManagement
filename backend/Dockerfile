# Use a lightweight Python base image
FROM python:3.10-slim

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libfreetype6-dev \
    libjpeg-dev \
    libpng-dev \
    zlib1g-dev \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /django

# Copy requirements file
COPY requirements.txt .
# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt


# Expose the default application port
EXPOSE 8000
COPY . .


# Run the Django development server
CMD ["sh", "-c", "python manage.py runserver 0.0.0.0:8000"]
