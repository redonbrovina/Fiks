from pyspark.sql import SparkSession
from pyspark.sql.functions import col, trim, initcap

def main():
    print("Starting Spark Data Sanitization...")
    
    # Initialize Spark Session
    # Note: In a real production env, you would use .config("spark.mongodb.output.uri", ...)
    spark = SparkSession.builder \
        .appName("FiksDataSanitizer") \
        .getOrCreate()

    # Load Raw Dataset (Bronze Layer)
    raw_df = spark.read.csv("datasets/albanian_names_raw.csv", header=True)
    print("Bronze Layer: Raw data loaded from CSV.")

    # Process Data (Silver Layer - Cleaning)
    # 1. Trim whitespace, 2. Initcap, 3. Filter nulls
    silver_df = raw_df.select(
        initcap(trim(col("first_name"))).alias("first_name"),
        initcap(trim(col("last_name"))).alias("last_name"),
        col("gender")
    ).filter(col("first_name").isNotNull() & (col("first_name") != ""))
    print(f"Silver Layer: Cleaned {silver_df.count()} records.")

    # Aggregate & Prepare (Gold Layer - ML Ready)
    # Deduplicate and ensure only quality records are passed to the ML training set
    gold_df = silver_df.dropDuplicates(["first_name", "last_name"])
    print(f"Gold Layer: Finalized {gold_df.count()} unique records for ML Training.")
    
    # In a real Spark-Mongo setup:
    # gold_df.write.format("mongodb").option("collection", "gold_training_set").mode("overwrite").save()
    
    print("Data Lakehouse Ingestion Complete: Bronze -> Silver -> Gold transition successful.")
    spark.stop()

if __name__ == "__main__":
    main()
