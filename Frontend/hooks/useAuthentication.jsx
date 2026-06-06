import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
  saveUserInfo,
  getUserInfo
} from "../utils/TokenUtilities";
import { useEffect, useState } from "react";
import { login, getMe } from "../services/AuthService";

const useAuthentication = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(getUserInfo());
  const [isLoading, setIsLoading] = useState(true);

  const validateLogin = () => {
    return !!getAccessToken();
  };

  const fetchUserInfo = async () => {
    try {
      const userData = await getMe();
      saveUserInfo(userData);
      setUserInfo(userData);
      return userData;
    } catch (error) {
      console.error("Error fetching user info:", error);
      removeAccessToken();
      return null;
    }
  };

  const doLogin = async (loginData) => {
    try {
      const response = await login(loginData);
      saveAccessToken(response.token);

      const userData = await fetchUserInfo();
      if (userData) {
        if (userData.role === 'admin') {
          navigate("/admin/dashboard");
        } else {
          navigate("/user/buscar-tutores");
        }
      }
      return true;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return false;
    }
  };

  const doLogout = () => {
    removeAccessToken();
    setUserInfo(null);
    navigate("/login");
  };

  useEffect(() => {
    const initAuth = async () => {
      if (validateLogin() && !userInfo) {
        await fetchUserInfo();
      }
      setIsLoading(false);
    };
    initAuth();
    // eslint-disable-next-line
  }, []);

  return {
    doLogin,
    doLogout,
    validateLogin,
    fetchUserInfo,
    userInfo,
    isLoading
  };
};

export default useAuthentication;
