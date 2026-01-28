import os
import subprocess
import logging
from datetime import datetime
from minio import Minio
from minio.error import S3Error

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def perform_backup():
    logger.info("Starting MongoDB Backup Job...")
    
    # Configuration
    minio_endpoint = os.getenv("MINIO_ENDPOINT", "minio:9000")
    minio_access_key = os.getenv("MINIO_ROOT_USER", "admin")
    minio_secret_key = os.getenv("MINIO_ROOT_PASSWORD", "password123")
    minio_bucket = os.getenv("MINIO_BUCKET_NAME", "mongodb-backups")
    
    mongodb_uri = os.getenv("MONGODB_URI", "mongodb+srv://univenadmin:7anDtT3SJNX2zgDj@cluster0.qhpwdw3.mongodb.net/test?appName=Cluster0")
    
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_filename = f"backup_{timestamp}.gz"
    backup_path = f"/tmp/{backup_filename}"

    try:
        # 1. Initialize Minio Client
        client = Minio(
            minio_endpoint,
            access_key=minio_access_key,
            secret_key=minio_secret_key,
            secure=False
        )

        # 2. Ensure bucket exists
        if not client.bucket_exists(minio_bucket):
            logger.info(f"Bucket {minio_bucket} does not exist. Creating...")
            client.make_bucket(minio_bucket)
        
        # 3. Create Backup using mongodump
        logger.info(f"Dumping database to {backup_path}...")
        
        # Ensure mongodump is available
        # mongodump --uri="<uri>" --archive="<path>" --gzip
        dump_cmd = [
            "mongodump",
            f"--uri={mongodb_uri}",
            f"--archive={backup_path}",
            "--gzip"
        ]
        
        subprocess.run(dump_cmd, check=True)
        logger.info("Database dump successful.")

        # 4. Upload to Minio
        logger.info(f"Uploading {backup_filename} to Minio bucket {minio_bucket}...")
        client.fput_object(
            minio_bucket,
            backup_filename,
            backup_path,
            content_type="application/gzip"
        )
        logger.info("Upload successful.")

        # 5. Cleanup
        os.remove(backup_path)
        logger.info("Cleanup completed.")
        
    except subprocess.CalledProcessError as e:
        logger.error(f"Error during mongodump: {e}")
    except S3Error as e:
        logger.error(f"Error interacting with Minio: {e}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        if os.path.exists(backup_path):
            os.remove(backup_path)

if __name__ == "__main__":
    perform_backup()
