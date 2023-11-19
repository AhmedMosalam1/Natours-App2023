//console.log("helllllllllllllo frrombundle")
/* eslint-disable */

import '@babel/polyfill'
import { displayMap } from './mapbox'
import { login, logout, SignUp, forget, reset } from './login'
import { updateSettings } from './updatedSettings'
import { bookTour } from './stripe';
//----------------------------------------------------------------
const mapBox = document.getElementById('map')

if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations)
    displayMap(locations)
}

//----------------------------------------------------------------
const loginForm = document.querySelector('.form--login')

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value

        login(email, password)
    })
}

//----------------------------------------------------------------
const resetPass = document.querySelector('.form--resetpass')

if (resetPass) {
    resetPass.addEventListener('submit', e => {
        e.preventDefault()
        document.querySelector('.btn--save-password').innerHTML = 'Updating Password...';
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('passwordConfirm').value

        if (password != passwordConfirm)
            showAlert('error', 'Password and Confirm Password should be same!');
        else {
            reset(password, passwordConfirm, window.location.pathname.split('/')[2]);
        }
        document.querySelector('.btn--reset-password').innerHTML = 'Reset Password';
    })
}

//----------------------------------------------------------------
const forGet = document.querySelector('.form--forget')

if (forGet) {
    forGet.addEventListener('submit', e => {
        e.preventDefault()
        const email = document.getElementById('email').value
        forget(email)
    })
}

//----------------------------------------------------------------
const SignUpForm = document.querySelector('.form--signup')

if (SignUpForm) {
    SignUpForm.addEventListener('submit', e => {
        e.preventDefault()
        const name = document.getElementById('name').value
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        const passwordConfirm = document.getElementById('passwordConfirm').value

        SignUp(name, email, password, passwordConfirm)
    })
}

//----------------------------------------------------------------
const logOut = document.querySelector('.nav__el--logout')

if (logOut) logOut.addEventListener('click', logout)

//-----------------------------------------------------------------

const userDataForm = document.querySelector(".form-user-data");

if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        e.preventDefault()
        const form = new FormData() // to be form multitype 

        form.append('name', document.getElementById('name').value)
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0])

        // console.log(form)
        updateSettings(form, 'data')
    })
}


//----------------------------------------------------------------

const userPasswordForm = document.querySelector(".form-user-password");

if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        e.preventDefault()

        document.querySelector(".btn--save-password").textContent = "Updating....."

        const passwordCurrent = document.getElementById('password-current').value
        const password = document.getElementById('password').value
        const passwordConfrim = document.getElementById('password-confirm').value

        await updateSettings({ passwordCurrent, password, passwordConfrim }, 'password')

        document.querySelector(".btn--save-password").textContent = "Save Password"
        document.getElementById('password-current').value = " "
        document.getElementById('password').value = " "
        document.getElementById('password-confirm').value = " "
    })
}

//----------------------------------------------------------------

const bookBtn = document.getElementById('book-tour')

if (bookBtn) {
    bookBtn.addEventListener('click', async e => {
        e.target.textContent = 'processing....!'
        const { tourId } = e.target.dataset
        await bookTour(tourId)
    })
}

