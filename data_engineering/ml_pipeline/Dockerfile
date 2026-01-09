FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run linter
RUN ruff check .

# Run both scripts sequentially
CMD python generator.py && python seeder.py
