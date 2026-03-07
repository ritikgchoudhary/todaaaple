import React, {useState, useEffect}from 'react';
import {Paper,Typography} from '@material-ui/core/';
import useStyles from "../../home/style/game";
import { Link } from "react-router-dom";





const MyTask = () => {
    const [isAuth, setAuth] = useState(false);

  useEffect(() => {
    
      const loggedInUser =  localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
      console.log('logged in');
     
    }else{
      console.log('not logged in');
      window.location.replace("/login");

    }
    
  }, []); 
    const classes = useStyles();

    return (
        <div>
           <Link to='../profile' style={{textDecoration: 'none', color: 'black'}}>

            <Paper className={classes.myTask}>
                <Typography>.</Typography>
            </Paper>
            </Link>

            
        </div>
    )
}

export default MyTask ; 
