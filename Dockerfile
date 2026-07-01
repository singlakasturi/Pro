# Stage 1: Build the Spring Boot Application
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY Pro/pom.xml .
COPY Pro/src ./src
RUN mvn clean package -DskipTests

# Stage 2: Setup the Runtime Environment (Java + Python + Playwright)
FROM eclipse-temurin:21-jre
WORKDIR /app

# Install Python and basic system utilities
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the built jar from the build stage
COPY --from=build /app/target/Pro-0.0.1-SNAPSHOT.jar app.jar

# Copy the scraper scripts
COPY data ./data

# Setup the Python virtual environment and install dependencies
RUN python3 -m venv /app/data/.venv
RUN /app/data/.venv/bin/pip install --no-cache-dir -r /app/data/requirements.txt
RUN /app/data/.venv/bin/pip install /app/data/api_client

# Install Playwright browser binaries and dependencies
RUN /app/data/.venv/bin/playwright install chromium
RUN /app/data/.venv/bin/playwright install-deps

# Expose Spring Boot's port
EXPOSE 8080

# Command to start the application
CMD ["java", "-jar", "app.jar"]
