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
};

const getAllUsers = () => {
    return axios.get(`${API_URL}/user`, getAuthHeaders()).then(r => r.data);
};

const getUserById = (id) => {
    return axios.get(`${API_URL}/user/${id}`, getAuthHeaders()).then(r => r.data);
};

const updateUser = (id, userData) => {
    return axios.patch(`${API_URL}/user/${id}`, userData, getAuthHeaders()).then(r => r.data);
};

export { getAllUsers, getUserById, updateUser };
