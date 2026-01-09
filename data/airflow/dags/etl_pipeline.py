from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.postgres_operator import PostgresOperator
from airflow.operators.python_operator import PythonOperator
import pandas as pd
from sqlalchemy import create_engine

default_args = {
    'owner': 'fiks_admin',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 1,
    'retry_delay': timedelta(minutes=5),
}

dag = DAG(
    'fiks_daily_etl',
    default_args=default_args,
    description='Daily ETL pipeline for Fiks platform',
    schedule_interval=timedelta(days=1),
)

# Task 1: Data Quality Check
check_users_sql = "SELECT COUNT(*) FROM users;"
t1 = PostgresOperator(
    task_id='check_user_data',
    postgres_conn_id='fiks_identity_db',
    sql=check_users_sql,
    dag=dag,
)

# Task 2: Extract and Transform (Python)
def extract_transform():
    # Simulate DB connection
    identity_engine = create_engine('postgresql://user:pass@identity-db:5432/identity')
    booking_engine = create_engine('postgresql://user:pass@booking-db:5432/booking')
    
    # Extract
    users = pd.read_sql("SELECT id, city, created_at FROM users", identity_engine)
    bookings = pd.read_sql("SELECT id, user_id, amount, created_at FROM bookings", booking_engine)
    
    # Transform: Join and Filter
    merged = pd.merge(bookings, users, left_on='user_id', right_on='id')
    high_value = merged[merged['amount'] > 50]
    
    # Load (Data Lake Simulation - Save to Parquet)
    high_value.to_parquet('/data/datalake/high_value_bookings.parquet')

t2 = PythonOperator(
    task_id='process_analytics',
    python_callable=extract_transform,
    dag=dag,
)

# Task 3: Notify Success
def notify_success():
    print("ETL Pipeline completed successfully.")

t3 = PythonOperator(
    task_id='notify_admin',
    python_callable=notify_success,
    dag=dag,
)

t1 >> t2 >> t3
