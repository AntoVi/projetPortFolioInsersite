// import axios from 'axios';

const signForm = document.querySelector('.signup--form');

const signup = async (name, email, password, passwordConfirm) => {
    try {
        const res = await axios({
              method: 'POST',
              url: 'http://127.0.0.1:8000/boutique/v1/users/signup',
              data: {
                  name: name,
                  email: email,
                  password: password,
                  passwordConfirm: passwordConfirm
              }
             })
             
          if(res.data.status === 'success') {
              alert('Signed in successfully!');
              window.setTimeout(() => {
                  location.assign('/');
              }, 1000)
          }
          
      } catch (err) {
          alert(err.response.data.message)
      }
}

if(signForm){
    signForm.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('password-confirm')
        signup(name, email, password, passwordConfirm)
    })
    
}