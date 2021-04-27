from flask_wtf import FlaskForm
from wtforms import TextAreaField,StringField, SelectField, PasswordField
from flask_wtf.file import FileField, FileRequired, FileAllowed
from wtforms.validators import DataRequired, InputRequired, Length, Email 


selection_of_car_type = [('Convertible', 'Convertible'), ('Coupe', 'Coupe'), ('Hatchback', 'Hatchback'), ('Sedan', 'Sedan'), ('Sports Car', 'Sports Car'), ('SUV', 'SUV')]
transmission_type = [('Automatic', 'Automatic'), ('Manual', 'Manual')]

class ExploreForm(FlaskForm):
	make = StringField('Make', validators=[DataRequired()])
	model = StringField('Model', validators=[DataRequired()])
    
class AddNewCarForm(FlaskForm):
    make = StringField('Make', validators=[DataRequired()])
    model = StringField('Model', validators=[DataRequired()])
    colour = StringField('Colour', validators=[DataRequired()])
    year = StringField('Year', validators=[DataRequired()])
    price = StringField('Price', validators=[DataRequired()])
    car_type = SelectField('Car Type', choices=selection_of_car_type)
    transmission = SelectField('Transmission', choices=transmission_type)
    description = TextAreaField('Description', validators=[DataRequired()])
    photo = FileField('File', validators=[FileRequired(), 
    FileAllowed(['jpeg', 'jpg', 'png', 'Images Only!'])])
    
class RegisterForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[InputRequired()])
    fullname = StringField('Fullname',validators=[DataRequired()])
    email = StringField('Email', validators = [DataRequired(), Email(message=('Not a valid email address.'))])
    location = StringField('Location', validators= [DataRequired()])
    biography = TextAreaField('Biography', validators=[DataRequired(), Length(5, 255, message=('Your message is too short.'))])
    photo = FileField('Upload Photo', validators=[FileRequired(), FileAllowed(['jpg','png','jpeg','Image Files Only'])])

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[InputRequired()])