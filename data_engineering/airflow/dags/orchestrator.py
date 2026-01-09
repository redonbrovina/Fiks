from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.bash import BashOperator

default_args = {
    'owner': 'redon',
    'depends_on_past': False,
    'email_on_failure': False,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

with DAG(
    'fiks_ml_pipeline_orchestrator',
    default_args=default_args,
    description='Orchestrates the ML Name Generation and Seeding Pipeline',
    schedule_interval=timedelta(days=1),
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=['fiks', 'ml', 'etl'],
) as dag:

    # Task 1: Clean Data using Spark (Simulated call)
    process_raw_data = BashOperator(
        task_id='spark_clean_ingestion',
        bash_command='python /app/data_engineering/spark/spark_processor.py',
    )

    # Task 2: Generate names using ML Model
    generate_ml_names = BashOperator(
        task_id='ml_name_generation',
        bash_command='python /app/data_engineering/ml_pipeline/generator.py',
    )

    # Task 3: Seed Identity Service
    seed_identity_api = BashOperator(
        task_id='etl_seeding_task',
        bash_command='python /app/data_engineering/ml_pipeline/seeder.py',
    )

    # Workflow Dependency
    process_raw_data >> generate_ml_names >> seed_identity_api
