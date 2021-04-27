from flask import Flask
from .config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_wtf.csrf import CSRFProtect

app = Flask(__name__)
csrf = CSRFProtect(app)
db = SQLAlchemy(app)

app.config.from_object(Config)
from app import views