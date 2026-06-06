import axios from "axios";
import { getAccessToken } from "../utils/TokenUtilities";
import { API_URL } from "./config";

const getAuthHeaders = () => {
    const token = getAccessToken();
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
}

const login = (loginData) => {
    return new Promise((resolve, reject) => {
        axios.post(`${API_URL}/auth/login`, loginData)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });
    });
}

const register = (registerData) => {
    return new Promise((resolve, reject) => {
        axios.post(`${API_URL}/auth/register`, registerData)
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });
    });
}

const   getMe = () => {
    return new Promise((resolve, reject) => {
        axios.get(`${API_URL}/auth/me`, getAuthHeaders())
            .then((response) => {
                resolve(response.data);
            })
            .catch((error) => {
                console.error(error);
                reject(error);
            });
    });
}

export { login, register, getMe };
