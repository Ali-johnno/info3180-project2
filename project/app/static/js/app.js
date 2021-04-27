/* Add your Application JavaScript */
// Instantiate our main Vue Instance

const login = {
    name: 'login',
    template:
    `
    <div id='login-form'>
    <h4>Login to your account</h4>
    <br/>
    <form method="POST" id="LoginForm" @submit.prevent="login">
        <fieldset class="form-group">
            <label for='username'>Username</label>
            <input type="text" name='username' class='form-control'/>
        </fieldset>
        <fieldset class="form-group">
            <label for='password'>Password</label>
            <input type='password' name='password' class='form-control'/>
        </fieldset>
        <button type='submit' class='btn btn-success btn-block'>Login</button>
    </form>
    </div>
    
    `,
    data(){
        return {
            messages:[]
        }
    },
    methods: {
        login(){
            let self=this;
            let loginForm = document.getElementById('LoginForm');
            let form_data = new FormData(loginForm)

            fetch("/api/auth/login",{
                method:'POST',
                body: form_data,
                headers: {
                    'X-CSRFToken':token
                },
                credentials:'same-origin'
            })
            .then(function(response){
                console.log(response)
                return response.json();
            })
            .then(function(jsonResponse){
                if (jsonResponse['access'] === 'fail'){
                    self.messages = [jsonResponse['message']];
                } else{
                    localStorage.setItem('token',jsonResponse['jwttoken']);
                    localStorage.setItem('user_id',jsonResponse['user_id']);
                    loggedout = document.getElementsByClassName('logIn');
                    loggedin = document.getElementsByClassName('logOut')
                    for (let index = 0; index < loggedout.length; index++) {
                        const element = loggedout[index];
                        element.classList.toggle('show-element');
                    }
                    for (let index = 0; index < loggedin.length; index++) {
                        const element = loggedin[index];
                        element.classList.toggle('hide-element');
                    }
                    self.messages = [jsonResponse['message']];
                    router.push({path:"/explore"});
                }
            })
            .catch(function(error){
                console.log(error);
            });
        }
    }
};

const logout = {
    name:'logout',
    template: ``,
    created(){
        fetch('/api/auth/logout',{
            method:"POST",
            headers:{
                'X-CSRFToken':token,
                'Authorization': 'Bearer' + ' ' + localStorage.getItem('token')
            }
        })
        .then(function(response){
            return response.json();
        })
        .then(function(jsonResponse){
            loggedout = document.getElementsByClassName('logIn');
            for (let index = 0; index < loggedout.length; index++) {
                const element = loggedout[index];
                element.classList.toggle('hide-element');
            }
            localStorage.removeItem('token');
            localStorage.removeItem('user_id');
            router.push( {path:"/"});
            
           
        })
        .catch(function(error){
            console.log(error);
        })
        

    }
}

const registerUser = {
    name: 'registerUser',
    template:`
    <div v-if="error !==[]">
        <ul class="errors" v-for='err in error'>
            <li>{{err}}</li>
        </ul>
    </div>
    <form method="POST" id='RegisterForm'  @submit.prevent="register">
        <div class='form-grid'>    
            <fieldset class='grid-new form-group'>
                <label for='username'>Username</label>
                <input type="text" name='username' class='form-control'/>
            </fieldset>
            <fieldset class='grid-new form-group'>
                <label for='password'>Password</label>
                <input type='password' name='password' class='form-control'/>
            </fieldset>
            <fieldset class='grid-new form-group'>
                <label for='fullname'>Fullname</label>
                <input type='text' name='fullname' class='form-control'/>
            </fieldset>
            <fieldset class='grid-new form-group'>
                <label for='email'>Email</label>
                <input type='text' name='email' class='form-control'/>
            </fieldset>
            <fieldset class='grid-new form-group'>
                <label for='location'>Location</label>
                <input type='text' name='location' class='form-control'/>
            </fieldset>
        </div>
		<fieldset class='grid-new form-group'>
            <label for='biography'>Biography</label>
            <textarea name='biography' type='text' class='form-control'></textarea>
        </fieldset>
		<fieldset class='grid-new form-group'>
            <label for='photo'>Upload Photo</label>
            <input type="file" name="photo" accept=".jpeg, .jpg, .png" class='form-control'>
        </fieldset>
        <button type='submit' class='btn btn-success'>Register</button>
    </form>
    `,
    data(){
        return {
           error:[]
        }
    },
    methods: {
        register(){
            let self=this;
            let registerForm = document.getElementById('RegisterForm');
            let nform_data = new FormData(registerForm);
            fetch("/api/register", {
                method: 'POST',
                body: nform_data,
                headers: {
                    'X-CSRFToken': token
                },
                credentials: 'same-origin'        
            })
            .then(function(response){
                return response.json();
            })
            .then(function(jsonResponse){
                console.log(jsonResponse['user_info']['status'])
                if (jsonResponse['user_info']['status'] === 'fail'){
                    self.error = jsonResponse['user_info']['message']
                } else {
                    router.push({path:"/login"});
                }
                
            })
            .catch(function(error){
                console.log(error);
            });
        }
    }
};

const explore={
    name: 'explore',
    template:
    `
    <div v-if="error !==[]">
        <ul class="errors" v-for='err in error'>
            <li>{{err}}</li>
        </ul>
    </div>
    <div>
        <h2>Explore</h2>
    </div>
    <div>
        <form method='GET' @submit.prevent='search' class="row" id='ExploreForm'>
            <fieldset class="col-md-3 form-group">
                <label for='make'>Make</label>
                <input type='text' name='make' class='form-control'/>
            </fieldset>
            <fieldset class=" col-md-3 form-group">
                <label for='model'>Model</label>
                <input type='text' name='model' class='form-control'/>
            </fieldset>
            <fieldset class=" col-md-3 form-group">
                <label for="button"> </label>
                <button type='submit' name='button' style="height:50%;width:100px;" class=" form-control btn btn-success">Search</button>
            </fieldset>
        </form>
    </div>
    <br/>
    <div v-if="cars === true" class='car-grid'>
        <div v-for='car in car_details' class='car-card'>
            <div class='car-image-container'>
                <img class='car-image' v-bind:src='car[0]' />
            </div>
            <div class='car-info'>
                <div class='year-price'>
                    <p class='year-make'>{{car[4]}} {{car[1]}}</p>
                    <p class="price"><img src='./static/pricetag.png' class='pricetag'/>{{car[3]}}</p>
                </div>               
                <p class='model'>{{car[2]}}</p>
                <button class='btn btn-primary btn-block' v-bind:value="car[5]" type=submit @click="viewDetails">View More Details</button>
            </div>
        </div>
    </div>
    <div v-else>
        <p>{{car_details}}</p>
    </div>
    `,
    created(){
        let self=this;
        fetch('/api/cars',{
            method:'GET',
            headers: {
                'Authorization': 'Bearer' + ' ' + localStorage.getItem('token')
            }
        })
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            console.log(data);
            self.car_details = data['cars']
        })
    },
    data(){
        return{
            car_details:{},
            cars:true,
            error:[]
        }
    },
    methods:{
        search(){
            let self=this;
            let ExploreForm = document.getElementById('ExploreForm');
            let form_data = new FormData(ExploreForm);

            fetch('/api/search',{
                method: 'POST',
                body: form_data,
                headers: {
                    'X-CSRFToken':token,
                    'Authorization': 'Bearer' + ' ' + localStorage.getItem('token')
                },
                credentials:'same-origin'
            })
            .then(function(response){
                return response.json();
            })
            .then(function(jsonResponse){
                console.log(jsonResponse)
                if (jsonResponse['errors']){
                    self.error=jsonResponse['errors'];
                } else{
                    self.error=[]
                    if (jsonResponse['car']){
                        self.car_details = jsonResponse['car'];
                        self.cars = true;
                    } else {
                        self.cars=false;
                        self.car_details = jsonResponse['no_car'];
                    }
                    
                }
            })
            .catch(function(error){
                console.log(error);
            });
        },
        viewDetails(e){
            car_id = e.target.getAttribute('value');
            router.push({path:`/cars/${car_id}`});

        }
    }
};

const AddNewCar =  {
    name: 'newCar',
    template:
    `
        <div v-if="message!==''">
            <p>{{message}}</p>
        </div>
        <div v-if="error !==[]">
            <ul class="errors" v-for='err in error'>
                <li>{{err}}</li>
            </ul>
        </div>

        <div>
            <form method="POST" id='AddNewCarForm' @submit.prevent='addCar' >
               <div class='form-grid'>
                    <fieldset class='grid-new form-group '>
                        <label for='make'>Make</label>
                        <input type='text' name='make' class='form-control'/>
                    </fieldset>
                    <fieldset class='grid-new form-group'>
                        <label for='model'>Model</label>
                        <input type='text' name='model' class='form-control'/>
                    </fieldset>
                    
                    <fieldset class='grid-new form-group'>
                        <label for='colour'>Colour</label>
                        <input type='text' name='colour' class='form-control'/>
                    </fieldset>
                    <fieldset class='grid-new form-group'>
                        <label for='year'>Year</label>
                        <input type='text' name='year' class='form-control'/>
                    </fieldset>
                    <fieldset class='grid-new form-group'>
                        <label for='price'>Price</label>
                        <input type='text' name='price' class='form-control'/>
                    </fieldset>
                    <fieldset class='grid-new form-group'>
                        <label for='car_type'>Car Type</label>
                        <select name='car_type' class="form-control">
                            <option value='Convertible'>Convertible</option>
                            <option value='Coupe'>Coupe</option>
                            <option value='Hatchback'>Hatchback</option>
                            <option value='Sedan'>Sedan</option>
                            <option value='Sports Car'>Sports Car</option>
                            <option value='SUV'>SUV</option>
                        </select>
                    </fieldset>
                    <fieldset class=' grid-newform-group'>
                        <label for='transmission'>Transmission</label>
                            <select name='transmission' class="form-control">
                                <option value='Automatic'>Automatic</option>
                                <option value='Manual'>Manual</option>
                            </select>
                    </fieldset>
               </div>
                <br/>
                <fieldset class='form-group'>
                    <label for='description'>Description</label>
                    <textarea type="text" name="description" class='form-control'></textarea>
                </fieldset>
                <fieldset class='form-group'>
                    <label for='photo'>Upload Photo</label>
                    <input type="file" name="photo" id="photo" accept="image/*" draggable="true" class='form-control'>
                </fieldset>
                <button type='submit' class='btn btn-success'>Save</button>
            </form>
        </div>
        
    `,
    data(){
        return {
            message:'',
            error:[]
        }
    },
    methods:
    {
        addCar(){
            let self = this;
            let AddNewCarForm = document.getElementById('AddNewCarForm');
            let form_data = new FormData(AddNewCarForm); 

            fetch('/api/cars',{
                method: 'POST',
                body: form_data,
                headers: {
                    'X-CSRFToken':token,
                    'Authorization': 'Bearer' + ' ' + localStorage.getItem('token')
                },
                credentials:'same-origin'
            })
            .then(function(response){
                return response.json();
            })
            .then(function(jsonResponse){
                if (jsonResponse['message']){
                    self.error=[];
                    self.message = jsonResponse['message'];
                } else{
                    self.message = '';
                    self.error = jsonResponse['errors'];
                }
            })
            .catch(function(errors){
                console.log(errors)
            });
        }    
    }
     
};

const ViewCarDetails = {
    name:'viewCar',
    template:
    `
    <div class="card car-card">
        <div class="your-mom">
            <div class="car-img">    
                <img :src="car_details['photo']" class='view-car-image'>
            </div>
            <div>
                <div class="car-info">
                    <h3>{{car_details['year']}} {{car_details['make']}}</h3>
                    <p class='car-model'>Model {{car_details['model']}}</p>
                    <p class='grey'>{{car_details['description']}}</p>
                    <div id='user-profile-info'>
                        <div>
                            <p class='grey'>Colour</p> 
                        </div>
                        <div>
                            <p> {{car_details['colour']}}</p>
                        </div>
                        <div>
                            <p class='grey'>Body Type</p>
                        </div>
                        <div>
                            <p> {{car_details['car_type']}}</p>
                        </div>
                     </div>
                     <div id='user-profile-info'>
                        <div>
                        <p class='grey'>Price</p> 
                        </div>
                        <div>
                            <p > {{car_details['price']}}</p>
                        </div>
                        <div>
                            <p class='grey'>Transmission  </p>
                        </div>
                        <div>
                            <p> {{car_details['transmission']}}</p>
                        </div>
                  </div>
                    <div>
                        <button class="btn btn-success">Email Owner</button>
                        <div class='stage'>
                            <div @click='favourite' class="heart"></div>
                        </div>
                        
                    </div>
                </div>
            
            </div>
        </div>
    </div>
    
    `,
    created(){
        let self = this;
        let route = this.$route.params.car_id;

        fetch(`/api/cars/${route}`,{
            method:'GET',
            headers: {
                'Authorization': 'Bearer' + ' ' + localStorage.getItem('token')
            },
            credentials:'same-origin'
        })
        .then(function(response){
            return response.json();
        })
        .then(function(data){
            console.log(data);
            if (data['fav'] === true){
                heart = document.getElementsByClassName('heart')[0].classList.add('is-active');
            }
            self.car_details = data
        })
    },
    data(){
        return{
            car_details:{},
            favourited :''
        }
    },
    methods:{
        favourite(e){
            let self= this;
            let route = this.$route.params.car_id;
            e.target.classList.toggle("is-active");
            
            fetch('/api/cars/'+route+'/favourite',{
                method: 'POST',
                headers:{
                    'X-CSRFToken':token,
                    'Authorization': 'Bearer' + ' ' + localStorage.getItem('token')
                },
                credentials:'same-origin'
            })
            .then(function(response){
                return response.json();
            })
            .then(function(jsonResponse){
                console.log(jsonResponse);
            })
            .catch(function(error){
                console.log(error);
            });
        }
    }
}


const UserProfile = {
    name:'UserProfile',
    template:
    `
    <div class='profile'>
        
        <img class='profile-picture' :src='user_details[5]' class='profile-picture'>
       
        <div>
            <h2>{{user_details[1]}}</h2>
            <p class='grey'>&#64;{{user_details[0]}}</p>
            <p class='grey'>{{user_details[4]}}</p>

            <div id='user-profile-info'>
                <div>
                    <p class='grey'>Email</p>
                    <p class='grey'>Location </p>
                    <p class='grey'>Joined</p>
                </div>
                <div>
                    <p> {{user_details[2]}}</p>
                    <p> {{user_details[3]}}</p>
                    <p> {{user_details[6]}}</p>
                </div>    
            </div>
        </div>
    </div>
    <br/>
    <div>
        <h4>Cars Favourited</h4>
        <div v-for='car in favourites'>
            <img v-bind:src=car[0][0]>
            <p>{{car[0][4]}} {{car[0][1]}}</p>
            <p>{{car[0][3]}}</p>
            <p>{{car[0][2]}}</p>
            <button v-bind:value="car[0][5]" type=submit @click="viewDetails">View More Details</button>
        </div>
    </div>
    `,
    created(){
        let self= this;
        let user_id = localStorage.getItem('user_id')

        fetch(`/api/users/${user_id}`,{
            method: 'GET',
            headers:{
                'Authorization': 'Bearer' + ' ' + localStorage.getItem('token')
            },
            credentials:'same-origin'
        })
        .then(function(response){
            return response.json();
        })
        .then(function(jsonResponse){
            self.user_details =  jsonResponse['user']
            fetch(`/api/users/${user_id}/favourites`,{
                method: 'GET',
                headers: {
                    'X-CSRFToken':token,
                    'Authorization': 'Bearer' + ' ' + localStorage.getItem('token')
                },
                credentials: 'same-origin'
            })
            .then(function(response){
                return response.json();
            })
            .then(function(jsonResponse){
                console.log(jsonResponse['fav'])
                self.favourites = jsonResponse['fav'];
            })
            .catch(function(error){
                console.log(error)
            });
        })
        .catch(function(error){
            console.log(error)
        });
    },
    data(){
        return{
            user_details:{},
            favourites:{}
        }
    },
    methods:{
        viewDetails(e){
            car_id = e.target.getAttribute('value');
            router.push({path:`/cars/${car_id}`});
    
        }
    }
    
}

const Home = {
    name: 'Home',
    template: `
    <div class="d-flex align-items-center home-div col-md-12">
            <div class="row align-items-center col-md-6 intro">
                <h1 class="font-weight-bold">Buy and Sell Cars Online</h1>
                <p class="mt-2 mb-4 text-secondary">United Auto Sales provides the fastest, easiest and most user friendly way to buy or sell cars online. Find a Great Price on the Vehicle You Want</p>
                <div class="add-gap">
                    <button @click="register" class="btn btn-primary btn-block">Register</button>
                    <button @click="login" class="btn btn-success">Login</button>
                </div>
            </div>
            <div class="fit col-md-6">
                <img src="./static/buickencore.jpg" class='home-image'>
            </div>
        </div>
    `,
    data() {
        return {}
    },
	methods:{
		register(){
			router.push({path:"/register"})
		},
		login(){
			router.push({path:"/login"})
		}
	}	
};

const app = Vue.createApp({
    data() {
        return {

        }
    },
    components:{
        'home': Home,
        'login':login,
        'newUser': registerUser,
        'explore': explore,
        'newCar': AddNewCar,
        'viewCar':ViewCarDetails,
        'UserProfile': UserProfile
    }
});

app.component('app-header', {
    name: 'AppHeader',
    template: `
    <nav class="navbar navbar-expand-lg navbar-dark header-bg fixed-top">
        <a class="navbar-brand" href="#"><img src="./static/car.png" id='car-image'></a>
        <a class="navbar-brand" href="#">United Auto Sales</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
    
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav mx-auto">
            <li class="nav-item active logIn hide-element">
                <router-link class="nav-link" to="/cars/new">Add Car<span class="sr-only">(current)</span></router-link>
            </li>
            <li class="nav-item active logIn hide-element">
                <router-link class="nav-link" to="/explore">Explore<span class="sr-only">(current)</span></router-link>
            </li>
            <li class="nav-item active logIn hide-element">
                <router-link class="nav-link" :to="{ name: 'user',params:{user_id: id}}">My Profile<span class="sr-only">(current)</span></router-link>
            </li>
        </ul>
          
        </ul>
        <ul  class="navbar-nav" >
            <li class="nav-item active logOut">
                <router-link class="nav-link" to="/register">Register<span class="sr-only">(current)</span></router-link>
            </li>
            <li class="nav-item active logOut">
                <router-link class="nav-link" to="/login">Login<span class="sr-only">(current)</span></router-link>
            </li>
            <li class="nav-item active logIn hide-element">
                <router-link class="nav-link" to="/logout">Logout<span class="sr-only">(current)</span></router-link>
            </li>
        </ul>
      </div>
    </nav>
    `,
    data: function(){
        return {
            authorised: localStorage.user_id===null ? true : false,
            id: localStorage.getItem('user_id')
        }
    },

    methods:{
        isLoggedIn(){
            if (localStorage.getItem('user_id') !== null){
                return true;
            } else {
                return false;
            }
        }
    }
    
});

app.component('app-footer', {
    name: 'AppFooter',
    template: `
    <footer>
        <div class="container">
            <p></p>
        </div>
    </footer>
    `
});



const NotFound = {
    name: 'NotFound',
    template: `
    <div>
        <h1>404 - Not Found</h1>
    </div>
    `,
    data() {
        return {}
    }
};




// Define Routes
const routes = [
    { path: "/", component: Home },
    {path: "/register", component:registerUser},
	{path: "/login", component:login},
	{path: "/logout", component:logout},
	{path: "/explore", component: explore},
	{path: "/users/:user_id", name:"user",component:UserProfile},
	{path: "/cars/new", component: AddNewCar},
	{path: "/cars/:car_id", component: ViewCarDetails},
    { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFound }
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes, // short for `routes: routes`
});

app.use(router);

app.mount('#app');