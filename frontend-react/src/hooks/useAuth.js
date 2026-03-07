import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

// Custom hook to handle authentication in components
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const history = useHistory();

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = () => {
      const loggedInUser = localStorage.getItem("user");
      
      if (loggedInUser) {
        try {
          const parsedUser = JSON.parse(loggedInUser);
          if (parsedUser && parsedUser.token) {
            setUser(parsedUser);
            setIsAuthenticated(true);
          } else {
            redirectToLogin();
          }
        } catch (error) {
          redirectToLogin();
        }
      } else {
        redirectToLogin();
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [history]);

  const redirectToLogin = () => {
    setUser(null);
    setIsAuthenticated(false);
    history.push('/login');
  };

  const logout = () => {
    localStorage.removeItem('user');
    redirectToLogin();
  };

  return { 
    user, 
    loading, 
    isAuthenticated,
    logout
  };
};

export default useAuth; 