import { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ✅ Load user & token on mount (persistent auth)
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    } else {
      setToken(null);
      setUser(null);
      setIsLoggedIn(false);
    }
  }, []);

  // ✅ Login function — saves to both state + localStorage
  const loginUser = (userData, jwtToken) => {
    localStorage.setItem("token", jwtToken);
    localStorage.setItem("user", JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    setIsLoggedIn(true);
  };

  // ✅ Logout function — clears everything and redirects safely
  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
    window.location.href = "/login"; // redirect to login instead of "/"
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
