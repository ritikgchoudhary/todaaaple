import React, { useState, useEffect } from 'react';
import { Route, useLocation, useHistory } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const location = useLocation();
  const history = useHistory();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = () => {
      try {
        const user = localStorage.getItem("user");
        if (!user) {
          setIsAuthenticated(false);
          return;
        }
        try {
          const foundUser = JSON.parse(user);
          if (foundUser && foundUser.token) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            localStorage.removeItem("user");
          }
        } catch (parseError) {
          setIsAuthenticated(false);
          localStorage.removeItem("user");
        }
      } catch (error) {
        console.error("Auth verification error:", error);
        setIsAuthenticated(false);
      }
    };
    verifyAuth();
  }, [location.pathname]);

  // Not logged in: redirect to login (replace so back button doesn't return here)
  useEffect(() => {
    if (isAuthenticated === false) {
      history.replace({
        pathname: "/login",
        state: { from: location },
      });
    }
  }, [isAuthenticated, history, location]);

  // Loading: show spinner
  if (isAuthenticated === null) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1A1A1A'
      }}>
        <CircularProgress style={{ color: '#FFD700' }} />
      </div>
    );
  }

  // Not authenticated: render nothing (redirect runs in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  return <Route {...rest} render={props => <Component {...props} />} />;
};

export default ProtectedRoute; 