import React from "react";
import { Container, Typography, Button } from "@material-ui/core";
import useStyles from "./style";
import { NavLink } from "react-router-dom";


const ErrorPage = () => {
    const classes = useStyles();
  return (
    <>
      <main>
        <div>
          <Container maxWidth="sm" className={classes.ErrorPage}>
            <Typography variant="h2" gutterBottom align="center">
              404 Page Not Found
            </Typography>
            <Typography variant="h5" gutterBottom align="center">
              The page you are looking for is not exist. Please check
              the url and try again.
            </Typography>
            <div align="center">
                <NavLink to="/signin">
            <Button variant="contained" color="primary" >
              Go to home Page
            </Button>
            </NavLink>
            </div>
            
          </Container>
        </div>
      </main>
    </>
  );
};

export default ErrorPage;
