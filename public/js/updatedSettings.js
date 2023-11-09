import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
    try {
        const url = type === "password"
            ? "http://localhost:3000/api/users/updatepassword"
            : "http://localhost:3000/api/users/updateme"

        const res = await axios({
            method: "PATCH",
            url,
            data
        })

        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully..!`)
            window.location.reload(true)
        }
    } catch (e) {
        showAlert('error', e.response.data.message)
    }
}