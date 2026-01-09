FROM python:3.9-slim

WORKDIR /app

# Install system dependencies for Spark if needed
RUN apt-get update && apt-get install -y default-jre && rm -rf /var/lib/apt/lists/*

COPY ml_pipeline/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Add data engineering scripts to the build
COPY . .

# Run linter
RUN ruff check .

# EXPLANATION: In a production environment, spark-submit or Airflow would trigger these.
# For this demonstration, we run them sequentially to show the data flow.
CMD echo "Step 1: Running Spark Sanitization (Bronze -> Silver -> Gold)..." && \
    python spark/spark_processor.py && \
    echo "Step 2: Training ML Model and Generating Identities..." && \
    python ml_pipeline/generator.py && \
    echo "Step 3: ETL Seeding to Identity Microservice..." && \
    python ml_pipeline/seeder.py
