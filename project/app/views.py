import os, datetime
from app import app, db
from flask import render_template, flash, request, redirect, url_for, send_from_directory,jsonify,g, session
from .forms import ExploreForm, AddNewCarForm, RegisterForm, LoginForm
from app.models import Cars, Favourites, Users
from werkzeug.utils import secure_filename
from werkzeug.security import check_password_hash 
import jwt
import re
from functools import wraps
from sqlalchemy import desc

def requires_auth(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    auth = request.headers.get('Authorization', None) # or request.cookies.get('token', None)

    if not auth:
      return jsonify({'code': 'authorization_header_missing', 'description': 'Authorization header is expected'}), 401

    parts = auth.split()
    if parts[0].lower() != 'bearer':
      return jsonify({'code': 'invalid_header', 'description': 'Authorization header must start with Bearer'}), 401
    elif len(parts) == 1:
      return jsonify({'code': 'invalid_header', 'description': 'Token not found'}), 401
    elif len(parts) > 2:
      return jsonify({'code': 'invalid_header', 'description': 'Authorization header must be Bearer + \s + token'}), 401

    token = parts[1]
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])

    except jwt.ExpiredSignatureError:
        return jsonify({'code': 'token_expired', 'description': 'token is expired'}), 401
    except jwt.DecodeError:
        return jsonify({'code': 'token_invalid_signature', 'description': 'Token signature is invalid'}), 401

    g.current_user = user = payload
    return f(*args, **kwargs)

  return decorated

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def home(path):
    return render_template('home.html')

@app.route('/api/register', methods=['POST'])
def register():
    form = RegisterForm()
    if request.method == "POST":
        if form.validate_on_submit():
            username = form.username.data
            password = request.form['password']
            fullname = request.form['fullname']
            email = request.form['email']
            location = request.form['location']
            biography = request.form['biography']
            photo = form.photo.data
            filename = save_photos(photo)
            user = Users(username,password,fullname,email,location,biography,filename)
            db.session.add(user)
            db.session.commit()
            user_info = {'status':'success','message':'New User Added'}
            return jsonify(user_info=user_info)
        else:
            user_info = {'status':'fail','message':form_errors(form)}
            return jsonify(user_info=user_info)
    

@app.route('/api/auth/login', methods=['POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit() and request.method=="POST":
        username = request.form['username']
        password = request.form['password']
        user = db.session.query(Users).filter(Users.username == username).first()
        if not user and not check_password_hash(user.password,password):
            return jsonify({'access':'fail', 'message':'Username and password do not match'})
        payload = {'user':user.id}
        jwtToken = jwt.encode(payload, app.config['SECRET_KEY'],algorithm='HS256')
        return jsonify({'access':'granted','message':'Successfully logged in','jwttoken':jwtToken, 'user_id':user.id})
    else:
        errors = form.errors
        return jsonify(errors=errors)


@app.route('/api/auth/logout',methods=['POST'])
@requires_auth
def logout():
    return jsonify({'message':'User successfully logged out'})

@app.route('/api/cars', methods=["GET","POST"])
@requires_auth
def cars():
    if request.method=="GET":
        all_cars = db.session.query(Cars).order_by(desc(Cars.id))
        cars = format_cars(all_cars)
        return jsonify({'cars':cars})
    elif request.method == "POST":
        form = AddNewCarForm()
        if form.validate_on_submit():
            make = request.form['make']
            model = request.form['model']
            colour = request.form['colour']
            year = request.form['year']
            price = re.sub("[^0-9]", "", request.form['price'])
            car_type = request.form['car_type']
            transmission = request.form['transmission']
            description = request.form['description']
            filename = save_photos(form.photo.data)
            user_id = g.current_user['user']
            car = Cars(description,make,model,colour,year,transmission,car_type,float(price),filename,user_id)
            db.session.add(car)
            db.session.commit()
            return jsonify({'message':'Car successfully added'})
        else:
            return jsonify({'errors':form_errors(form)})

def format_cars(all_cars):
    car_list = []
    for car in all_cars:
        photo = '/uploads/'+car.photo
        car_list.append([photo, car.make, car.model,"${:,.2f}".format(car.price), car.year, car.id])
    return car_list
    
@app.route('/api/search', methods=['POST'])
@requires_auth
def search():
    form = ExploreForm()
    if request.method=='POST':
        if form.validate_on_submit():
            make = request.form['make']
            model = request.form['model']
            car = db.session.query(Cars).filter(Cars.make==make,Cars.model==model).all()
            if car == []:
                return jsonify({'no_car':'There are no cars that fit this description'})
            else:
                return jsonify({'car':format_cars(car)})
        else:
            return jsonify({'errors':form_errors(form)})

@app.route('/uploads/<filename>')
def get_image(filename):
    root_dir = os.getcwd()
    return send_from_directory(os.path.join(root_dir, app.config['UPLOAD_FOLDER']), filename) 

@app.route('/api/cars/<car_id>', methods=['GET'])
@requires_auth
def show_car_id(car_id):
    if request.method=='GET':
        car = db.session.query(Cars).filter(Cars.id == car_id).first()
        favourite = isFavourite(car_id)
        photo = '/uploads/' + car.photo
        return jsonify({'id':car.id,'make':car.make,'model':car.model,'colour':car.colour,'year':car.year,'price':"${:,.2f}".format(car.price),'car_type':car.car_type,'transmission':car.transmission,'description':car.description,'photo':photo, 'fav':favourite})

@app.route('/api/users/<user_id>', methods=['GET'])
@requires_auth
def show_user_details(user_id):
    user = db.session.query(Users).filter(Users.id == user_id).first()
    user_info = format_details(user)
    return jsonify({'user':user_info})
    
@app.route('/api/users/<user_id>/favourites', methods=['GET'])
@requires_auth
def show_favourite_cars(user_id):
    fav = db.session.query(Favourites).filter(Favourites.user_id == user_id).all()
    faves = getCars(fav)
    return jsonify({'fav':faves})

def getCars(fav):
    cars=[]
    for car in fav:
        carId = car.car_id
        a_car = db.session.query(Cars).filter(Cars.id == carId)
        cars.append(format_cars(a_car))
    print(len(cars))
    return cars

def format_details(user):
    date = user.date_joined.strftime("%B %d, %Y")
    photo = '/uploads/' + user.photo
    user_dets = [user.username,user.name,user.email,user.location,user.biography,photo,date]
    return user_dets

 
@app.route('/api/cars/<car_id>/favourite', methods=['POST'])
@requires_auth
def add_to_favourite(car_id):
    fav_car = db.session.query(Favourites).filter(Favourites.car_id == car_id, Favourites.user_id==g.current_user['user']).first()
    if fav_car is None:
        favourite = Favourites(car_id,g.current_user['user'])
        db.session.add(favourite)
        db.session.commit()
        return jsonify({'status':'added'})
    else:
        db.session.delete(fav_car)
        db.session.commit()
        return jsonify({'status':'removed'})

   
def isFavourite(car_id):
    favourite = db.session.query(Favourites).filter(Favourites.car_id == car_id, Favourites.user_id==g.current_user['user']).first()
    if favourite is not None:
        return True
    return False    
    
def save_photos(photo):
    filename = secure_filename(photo.filename)
    photo.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return filename


# Display Flask WTF errors as Flash messages
def form_errors(form):
    error_messages = []
    """Collects form errors"""
    for field, errors in form.errors.items():
        for error in errors:
            message = u"Error in the %s field - %s" % (
                    getattr(form, field).label.text,
                    error
                )
            error_messages.append(message)
    return error_messages


@app.route('/<file_name>.txt')
def send_text_file(file_name):
    """Send your static text file."""
    file_dot_text = file_name + '.txt'
    return app.send_static_file(file_dot_text)

@app.after_request
def add_header(response):
    """
    Add headers to both force latest IE rendering engine or Chrome Frame,
    and also tell the browser not to cache the rendered page. If we wanted
    to we could change max-age to 600 seconds which would be 10 minutes.
    """
    response.headers['X-UA-Compatible'] = 'IE=Edge,chrome=1'
    response.headers['Cache-Control'] = 'public, max-age=0'
    return response

@app.errorhandler(404)
def page_not_found(error):
    """Custom 404 page."""
    return render_template('404.html'), 404

if __name__ == '__main__':
    app.run(debug=True,host="0.0.0.0",port="8080")    