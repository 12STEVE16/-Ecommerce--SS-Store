(function() {
    const registrationForm = document.getElementById('registrationForm');
    const regEmail = document.getElementById('registerEmail');
    const regPassword = document.getElementById('register-password');
    const firstName = document.getElementById('firstName');
    const secondName = document.getElementById('secondName');
    
    registrationForm.addEventListener("submit", e => {
        e.preventDefault();
        validateInputs();
    });

    const setError = (element, message) => {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');

        errorDisplay.innerText = message;
        inputControl.classList.add('error');
        inputControl.classList.remove('success');
    };

    const setSuccess = element => {
        const inputControl = element.parentElement;
        const errorDisplay = inputControl.querySelector('.error');
    
        errorDisplay.innerText = '';
        inputControl.classList.remove('error');
        inputControl.classList.add('success');
        
        const successCount = document.querySelectorAll('.success').length;
        if (successCount === 4) {
            registrationForm.submit();
        }
    };

    const isValidEmail = email => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    const validateInputs = () => {
        const firstNameValue = firstName.value.trim();
        const secondNameValue = secondName.value.trim();
        const emailValue = regEmail.value.trim();
        const passwordValue = regPassword.value.trim();

        // Validation for First Name
        if (firstNameValue === '') {
            setError(firstName, 'First Name is required');
        } else if (/\d/.test(firstNameValue)) {
            setError(firstName, 'First Name cannot contain numbers!');
        } else {
            setSuccess(firstName);
        }

        // Validation for Second Name
        if (secondNameValue === '') {
            setError(secondName, 'Second Name is required');
        } else if (/\d/.test(secondNameValue)) {
            setError(secondName, 'Second Name cannot contain numbers!');
        } else {
            setSuccess(secondName);
        }

        // Validation for Email
        if (emailValue === '') {
            setError(regEmail, 'Email is required');
        } else if (!isValidEmail(emailValue)) {
            setError(regEmail, 'Provide a valid email address');
        } else {
            setSuccess(regEmail);
        }

        // Validation for Password
        if (passwordValue === '') {
            setError(regPassword, 'Password is required');
        } else if (passwordValue.length < 8) {
            setError(regPassword, 'Password must be at least 8 characters.');
        } else {
            setSuccess(regPassword);
        }
    };
})();
