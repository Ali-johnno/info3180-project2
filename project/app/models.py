from datetime import datetime
from . import db
from werkzeug.security import generate_password_hash, check_password_hash

class Cars(db.Model):
    __tablename__ = 'cars'

    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String)
    make = db.Column(db.String)
    model = db.Column(db.String)
    colour = db.Column(db.String)
    year = db.Column(db.String)
    transmission = db.Column(db.String)
    car_type = db.Column(db.String)
    price = db.Column(db.Float)
    photo = db.Column(db.String)
    user_id = db.Column(db.Integer)

    def __init__(self, description, make, model, colour, year, transmission, car_type, price, photo, user_id):
        self.description = description
        self.make = make
        self.model = model
        self.colour = colour
        self.year = year
        self.transmission = transmission
        self.car_type = car_type
        self.price = price
        self.photo = photo
        self.user_id = user_id

class Favourites(db.Model):
    __tablename__ = 'favourites'

    id = db.Column(db.Integer, primary_key=True)
    car_id = db.Column(db.Integer)
    user_id = db.Column(db.Integer)

    def __init__ (self, car_id, user_id):
        self.car_id = car_id
        self.user_id = user_id

class Users(db.Model): 
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String)
    password = db.Column(db.String)
    name = db.Column(db.String)
    email = db.Column(db.String)
    location = db.Column(db.String)
    biography = db.Column(db.String)
    photo = db.Column(db.String)
    date_joined = db.Column(db.DateTime, nullable=False, default=datetime.now)

    def __init__(self, username, password, name, email, location, biography, photo):
        self.username = username
        self.password = generate_password_hash(password)
        self.name = name
        self.email = email
        self.location = location
        self.biography = biography
        self.photo = photo
        
    def is_authenticated(self):
        return True

    def is_active(self):
        return True

    def is_anonymous(self):
        return False

    def get_id(self):
        try:
            return unicode(self.id)  # python 2 support
        except NameError:
            return str(self.id)  # python 3 support

    def __repr__(self):
        return '<User %r>' % (self.username)