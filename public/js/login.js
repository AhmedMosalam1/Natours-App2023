import axios from 'axios';
import { showAlert } from './alerts';





export const SignUp = async (name, email, password, passwordConfirm) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm
      }
    })
    if (res.data.status === 'success') {
      showAlert("success", "SignUp Successfully!");
      window.setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
  } catch (e) {

    showAlert("error", e.response.data.message)
  }

}

export const login = async (email, password) => {
  console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/users/login',
      data: {
        email,
        password
      }
    })
    if (res.data.status === 'success') {
      showAlert("success", "logged in successfully!");
      window.setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
  } catch (e) {

    showAlert("error", e.response.data.message)
  }

}


export const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: 'http://localhost:3000/api/users/logout'
    })
    if (res.data.status === 'success') {
      showAlert("success", "logged out successfully!");
      window.setTimeout(() => {
        location.assign('/')
      }, 500)
    }

  } catch (e) {
    showAlert("error", e.response.data.message)
  }
}



export const forget = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:3000/api/users/forgetPassword',
      data: {
        email,
      }
    })
    if (res.data.status === 'success') {
      showAlert("success", "Email Sent successfully!");
      window.setTimeout(() => {
        location.assign('/')
      }, 1500)
    }
  } catch (e) {
    // window.location.reload()
    showAlert("error", e.response.data.message)
  }

}

export const reset = async (password, passwordConfirm, token) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url: `http://localhost:3000/api/users/resetPassword/${token}`,
      data: {
        password,
        passwordConfirm
      }
    })
    if (res.data.status === 'success') {
      showAlert("success", "Password Changed Successfully!");
      window.setTimeout(() => {
        location.assign('/login')
      }, 1500)
    }
  } catch (e) {

    showAlert("error", e.response.data.message)
  }

}






