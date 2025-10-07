import os
import logging
import certifi
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from pymongo.server_api import ServerApi
from dotenv import load_dotenv

# ------------------------------
# Load environment variables
# ------------------------------
load_dotenv()
MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority"
)
DB_NAME = os.getenv("DB_NAME", "courtroom_db")

# ------------------------------
# Setup logging
# ------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("db.mongo")

# ------------------------------
# Initialize MongoDB client
# ------------------------------
client = None
db = None

def init_mongo_client(max_retries=3, retry_delay=5):
    """Initialize MongoDB client with retries and exponential backoff
    
    Args:
        max_retries (int): Maximum number of connection attempts
        retry_delay (int): Initial delay between retries in seconds
    """
    global client, db
    
    attempt = 0
    last_error = None
    
    while attempt < max_retries:
        try:
            logger.info(f"Attempting MongoDB connection (attempt {attempt + 1}/{max_retries})")
            
            # Initialize MongoDB client with robust settings
            client = MongoClient(
                MONGO_URI,
                server_api=ServerApi("1"),
                tlsCAFile=certifi.where(),       # certifi CA bundle for SSL
                serverSelectionTimeoutMS=30000,  # 30s timeout
                connectTimeoutMS=30000,
                socketTimeoutMS=30000,
                maxPoolSize=50,
                retryWrites=True,
                w="majority",
                waitQueueTimeoutMS=10000,      # Wait queue timeout
                replicaSet=os.getenv("MONGO_REPLICA_SET"),  # Optional replica set
                readPreference="primaryPreferred"  # Read from primary if available
            )

            # Test the connection with retry
            client.admin.command("ping")
            db = client[DB_NAME]
            
            # Verify database access
            db.list_collection_names()
            
            logger.info(f"✅ Successfully connected to MongoDB: {DB_NAME}")
            return True
            
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            last_error = e
            logger.warning(f"❌ MongoDB connection attempt {attempt + 1} failed: {e}")
            
            attempt += 1
            if attempt < max_retries:
                wait_time = retry_delay * (2 ** (attempt - 1))  # Exponential backoff
                logger.info(f"Waiting {wait_time}s before retry...")
                import time
                time.sleep(wait_time)
            
        except Exception as e:
            last_error = e
            logger.error(f"❌ Unexpected error during MongoDB connection: {e}")
            break
    
    # If we get here, all retries failed
    logger.error(f"❌ Failed to connect to MongoDB after {max_retries} attempts: {last_error}")
    client = None
    db = None
    return False

# Initialize connection with retries
init_mongo_client()

# ------------------------------
# Default collections
# ------------------------------
case_collection = db["cases"] if db is not None else None
user_collection = db["users"] if db is not None else None
evidence_collection = db["evidence"] if db is not None else None

# ------------------------------
# Helper functions
# ------------------------------
def get_db():
    """Return the active database instance."""
    if db is None:
        raise ConnectionError("Database connection not available")
    return db

def get_collection(name: str):
    """Return a collection by name."""
    if db is None:
        raise ConnectionError("Database connection not available")
    return db[name]

def test_connection():
    """Test database connection and return status."""
    try:
        if client is not None:
            client.admin.command("ping")
            return True, "MongoDB connection successful!"
        else:
            return False, "MongoDB client not initialized"
    except Exception as e:
        return False, f"MongoDB connection failed: {str(e)}"

