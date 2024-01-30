window.addEventListener('load', () => {
  const form = document.getElementById('form');
  const username = document.getElementById('name');
  const firstName = document.getElementById('firstName');
  const secondName = document.getElementById('secondName');
  const email = document.getElementById('email');
  const mobile = document.getElementById('mobile');
  const password = document.getElementById('password');
  const loginMessageDiv = document.getElementById('loginMessage');
  const registrationMessageDiv = document.getElementById('registrationMessage');

  form.addEventListener('submit', (event) => {
      event.preventDefault();
      validateInputs();
  });

  const setError = (element, message) => {
      const inputControl = element.parentElement;
      const errorDisplay = inputControl.querySelector('.error');

      errorDisplay.innerText = message;
      inputControl.classList.add('error');
      inputControl.classList.remove('success');
  };

  const setSuccess = (element) => {
      const inputControl = element.parentElement;
      const errorDisplay = inputControl.querySelector('.error');

      errorDisplay.innerText = '';
      inputControl.classList.add('success');
      inputControl.classList.remove('error');

      if (document.querySelectorAll('.success').length === 5) {
          form.submit();
      }
  };

  const isValidEmail = (email) => {
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  };

  const validateInputs = () => {
      const usernameValue = username.value.trim();
      const emailValue = email.value.trim();
      const mobileValue = mobile.value.trim();
      const passwordValue = password.value.trim();
      const firstNameValue = firstName.value.trim();
      const secondNameValue = secondName.value.trim();

      const isRegistrationForm = form.action.includes('register');

      if (isRegistrationForm) {
          if (firstNameValue === '') {
              setError(firstName, 'First Name is required');
          } else {
              setSuccess(firstName);
          }

          if (secondNameValue === '') {
              setError(secondName, 'Second Name is required');
          } else {
              setSuccess(secondName);
          }

          registrationMessageDiv.innerText = 'Registration form submitted successfully.';
      } else {
          if (usernameValue === '') {
              setError(username, 'Name is required');
          } else {
              setSuccess(username);
          }

          if (emailValue === '') {
              setError(email, 'Email is required');
          } else if (!isValidEmail(emailValue)) {
              setError(email, 'Provide a valid email address');
          } else {
              setSuccess(email);
          }

          if (mobileValue === '' || mobileValue == null) {
              setError(mobile, 'Phone cannot be Blank!');
          } else if (isNaN(mobileValue)) {
              setError(mobile, 'Phone cannot contain letters!');
          } else if (mobileValue.length < 10 || mobileValue.length > 10) {
              setError(mobile, 'Phone must contain 10 digits..');
          } else {
              setSuccess(mobile);
          }

          if (passwordValue === '') {
              setError(password, 'Password is required');
          } else if (passwordValue.length < 8) {
              setError(password, 'Password must be at least 8 characters.');
          } else {
              setSuccess(password);
          }

          loginMessageDiv.innerText = 'Login form submitted successfully.';
      }
  };
});
