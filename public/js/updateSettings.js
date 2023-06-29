// import axios from 'axios';

const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');

// const hideAlert = () => {
//     const el = document.querySelector('.alert');
//     if (el) el.parentElement.removeChild(el);
//   };
const showAlert = (type, msg) => {
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector('.user-view__form-container').insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(hideAlert, 5000);
    hideAlert()
  };

  const alertMessage = document.querySelector('body').dataset.alert;
  if (alertMessage) showAlert('success', alertMessage, 20);

const updateSettings = async (data, type) => {
    try {
      const url =
        type === 'password'
          ? 'http://127.0.0.1:8000/boutique/v1/users/updateMyPassword'
          : 'http://127.0.0.1:8000/boutique/v1/users/updateMe';
  
      const res = await axios({
        method: 'PATCH',
        url,
        data
      });
  
      if (res.data.status === 'success') {
        showAlert('success', `${type.toUpperCase()} updated successfully!`);
      }
    } catch (err) {
      showAlert('error', err.response.data.message);
    }
  };

  if (userDataForm)
  userDataForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    updateSettings({ name, email }, 'data');
  });

if (userPasswordForm)
  userPasswordForm.addEventListener('submit', async e => {
    e.preventDefault();
    document.querySelector('.btn--save-password').textContent = 'Updating...';

    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    await updateSettings(
      { passwordCurrent, password, passwordConfirm },
      'password'
    );

    document.querySelector('.btn--save-password').textContent = 'Save password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

  