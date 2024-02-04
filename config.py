import os

from dotenv import load_dotenv

load_dotenv()

# Authentificate
SECRET_KEY = str(os.getenv('secret_key'))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 10080

DEBUG = True
DATABASE_URL = ''