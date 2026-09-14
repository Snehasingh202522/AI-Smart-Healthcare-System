import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import { DASHBOARD_ROUTES } from "../utils/constants";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token && !!user;

  const getDashboardRoute = useCallback((role) => {
    return DASHBOARD_ROUTES[role] || "/";
  }, []);

  // ================= INITIALIZE AUTH =================
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        setToken(storedToken);

        // If user is already stored, use it temporarily
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem("user");
          }
        }

        // Verify token and get fresh user
        const response = await authService.getMe();

        // authService already returns response.data.data
        const userData = response?.user || response?.data?.user;

        if (!userData) {
          throw new Error("Invalid user data received");
        }

        // Ensure user has the MongoDB _id (support both _id and id for backwards compatibility)
        const userId = userData._id || userData.id;
        if (!userId) {
          throw new Error("User ID missing from response");
        }

        // Normalize to _id for consistency
        userData._id = userId;
        delete userData.id;

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
      } catch (error) {
        console.error("Auth initialization failed:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ================= LOGIN =================
  const login = async (credentials) => {
    try {
      // authService.login already returns response.data.data
      const response = await authService.login(credentials);

      console.log("LOGIN RESPONSE:", response);

      const userData = response?.user;
      const authToken = response?.token;

      if (!userData || !authToken) {
        throw new Error("Invalid login response from server");
      }

      // Ensure user has the MongoDB _id (support both _id and id for backwards compatibility)
      const userId = userData._id || userData.id;
      if (!userId) {
        throw new Error("User ID missing from login response");
      }

      // Normalize to _id for consistency
      userData._id = userId;
      delete userData.id;

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);

      return {
        user: userData,
        dashboardRoute: getDashboardRoute(userData.role),
      };
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // ================= REGISTER =================
  const register = async (data) => {
    try {
      // authService.register already returns response.data.data
      const response = await authService.register(data);

      console.log("REGISTER RESPONSE:", response);

      const userData = response?.user;
      const authToken = response?.token;

      if (!userData || !authToken) {
        throw new Error("Invalid registration response from server");
      }

      // Ensure user has the MongoDB _id (support both _id and id for backwards compatibility)
      const userId = userData._id || userData.id;
      if (!userId) {
        throw new Error("User ID missing from registration response");
      }

      // Normalize to _id for consistency
      userData._id = userId;
      delete userData.id;

      localStorage.setItem("token", authToken);
      localStorage.setItem("user", JSON.stringify(userData));

      setToken(authToken);
      setUser(userData);

      return {
        user: userData,
        dashboardRoute: getDashboardRoute(userData.role),
      };
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  // ================= LOGOUT =================
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        getDashboardRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};