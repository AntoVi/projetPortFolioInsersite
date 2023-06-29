// import axios from 'axios';

const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');

const login = async (email, password) => {
    // enlevez plus tard les console logs
    try {
      const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/boutique/v1/users/login',
            data: {
                email: email,
                password: password
            }
           })

        if(res.data.status === 'success') {
            alert('Logged in successfully!');
            window.setTimeout(() => {
                location.assign('/');
            }, 1500)
        }
    } catch (err) {
        alert(err.response.data.message)
    }
   
}

if (loginForm)
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });


const logout = async () => {
    try {
      const res = await axios({
        method: 'GET',
        url: 'http://127.0.0.1:8000/boutique/v1/users/logout'
      });
      if ((res.data.status = 'success')) location.reload(true)
    } catch (err) {
      console.log(err.response);
      showAlert('error', 'Error logging out! Try again.');
    }
  };

if (logOutBtn) logOutBtn.addEventListener('click', logout);
  
 
