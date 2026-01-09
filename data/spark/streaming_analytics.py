from pyspark.sql import SparkSession
from pyspark.sql.functions import from_json, col, window, count
from pyspark.sql.types import StructType, StructField, StringType, DoubleType, TimestampType

# Define Schema for Booking Events
schema = StructType([
    StructField("booking_id", StringType(), True),
    StructField("user_id", StringType(), True),
    StructField("professional_id", StringType(), True),
    StructField("amount", DoubleType(), True),
    StructField("timestamp", TimestampType(), True),
    StructField("status", StringType(), True)
])

# Initialize Spark Session
spark = SparkSession \
    .builder \
    .appName("FiksStreamingAnalytics") \
    .config("spark.mongodb.output.uri", "mongodb://mongodb:27017/fiks.analytics") \
    .getOrCreate()

# Create Streaming DataFrame from Kafka
df = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", "kafka:9092") \
    .option("subscribe", "booking_created") \
    .option("startingOffsets", "earliest") \
    .load()

# Parse JSON Data
parsed_df = df.select(
    from_json(col("value").cast("string"), schema).alias("data"),
    col("timestamp")
).select("data.*", "timestamp")

# Perform Aggregations (e.g., Total Revenue per Professional per 1-minute window)
windowed_counts = parsed_df \
    .groupBy(
        window(col("timestamp"), "1 minute"),
        col("professional_id")
    ) \
    .agg(count("booking_id").alias("total_bookings"))

# Write Stream to Console (Debugging)
query_console = windowed_counts \
    .writeStream \
    .outputMode("complete") \
    .format("console") \
    .start()

# Write Stream to Data Lake / NoSQL (MongoDB)
query_mongo = windowed_counts \
    .writeStream \
    .outputMode("update") \
    .format("mongo") \
    .start()

query_console.awaitTermination()
query_mongo.awaitTermination()
