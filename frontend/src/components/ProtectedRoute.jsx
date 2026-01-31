import React, { useState, useEffect } from 'react';
import { Route, Redirect, useLocation } from 'react-router-dom';
import { CircularProgress } from '@material-ui/core';

const ProtectedRoute = ({ component: Component, ...rest }) => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const user = localStorage.getItem("user");
        
        if (!user) {
          setIsAuthenticated(false);
          return;
        }

        try {
          const foundUser = JSON.parse(user);
          
          // Check if user object has required fields
          if (foundUser && foundUser.token) {
            // Allow access if user data exists - simplified for testing
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

  // Show loading spinner while checking authentication
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

  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: location }
            }}
          />
        )
      }
    />
  );
};

export default ProtectedRoute; 