const saveAccessToken = (token) => {
    localStorage.setItem("tokenEvento", token);
    console.log("Token saved:", token);
}

const getAccessToken = () => {
    const token = localStorage.getItem("tokenEvento");
    return token;
}

const removeAccessToken = () => {
    localStorage.removeItem("tokenEvento");
    localStorage.removeItem("userInfo");
}

const decodeToken = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error decoding token:", error);
        return null;
    }
}

const getUserFromToken = () => {
    const token = getAccessToken();
    if (!token) return null;
    return decodeToken(token);
}

const saveUserInfo = (userInfo) => {
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
}

const getUserInfo = () => {
    const userInfo = localStorage.getItem("userInfo");
    return userInfo ? JSON.parse(userInfo) : null;
}

const isTokenExpired = (token) => {
    if (!token) return true;
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
}

export { saveAccessToken, getAccessToken, removeAccessToken, decodeToken, getUserFromToken, saveUserInfo, getUserInfo, isTokenExpired };
