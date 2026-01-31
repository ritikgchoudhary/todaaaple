import React, {useState, useEffect}from 'react';
import {Typography, Grid,TableContainer,Table,TableRow,Container,TableCell,TableHead,TableBody,Dialog,CircularProgress, Button} from '@material-ui/core/';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { Link } from "react-router-dom";
import * as api from "../../../api/auth";
import axios from 'axios';
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";

const RedEnvelopHistory = () => {
    const dispatch = useDispatch();
    const [isAuth, setAuth] = useState(false);
    const history = useHistory();
    const URL =  api.url;
    const [envelop,setEnvelop] = useState([]);
    
    const [openDialog, setDialog] = React.useState({open: false, body: ''});
    const [loader, setLoader] = React.useState(false);

    const dialogClose = () => {
      setDialog({ ...openDialog, open: false});
    };
    
    

    const copy =(e,id)=>{
      e.preventDefault();
      navigator.clipboard.writeText(`https://toddapple.live/getRedEnvelop/${id}`)
      setDialog({ ...openDialog, open:true, body: 'Copied Successfully'});
  }                

  useEffect(() => {
    
    const loggedInUser =  localStorage.getItem("user");
    if (loggedInUser) {
       
    const foundUser = JSON.parse(loggedInUser);
    setAuth(foundUser);
    const AuthStr = 'Bearer '.concat(foundUser.token);
    axios.get(`${URL}/getUserEnvelop/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
          setEnvelop(response.data);
          
    })
      .catch((error) => {
        
        
    });
     
    }else{
      history.push('/login');

    }
    
  }, []); 

//   const handleChange = (e) => {
//     const AuthStr = 'Bearer '.concat(isAuth.token);
//     setFormData({...formData, auth: AuthStr});
      
//     setFormData({ ...formData, [e.target.name]: e.target.value, userId: isAuth.result.id});
//     console.log(formData);
//   };

  const handleSubmit = async (e,id) => {
    e.preventDefault();
   
    setLoader(true);
    const loggedInUser =  localStorage.getItem("user");
    const foundUser = JSON.parse(loggedInUser);
    
    const AuthStr = 'Bearer '.concat(foundUser.token);
    axios.get(`${URL}/redeemEnvelop/${id}/${foundUser.result.id}`, { headers: { Authorization: AuthStr } })
      .then(response => {
          setLoader(false);
          setDialog({...openDialog, open: true, body: `Successfuly Redeemed ${response.data.amount}`});
          
    })
      .catch((error) => {
        
        
    });
    

   
    
    setLoader(false);

    
  };
    
    return (
        <div>
           <Dialog
                open={loader}
                PaperProps={{
                  style: {
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                  },
                }}
              >
                <Container  align="center" style={{backgroundColor: 'black', opacity: '0.6',height: '100px',paddingTop: "10px"}}>
                <CircularProgress style={{color: 'white',}} />
                <Typography style={{paddingTop: '10px', color: "white" }}>Please Wait!</Typography>
                </Container>
                
                
              </Dialog>
          <Dialog
                    open={openDialog.open}
                    onClose={dialogClose}
                    PaperProps={{
                    style: {
                        // backgroundColor: 'transparent',
                        boxShadow: 'none',
                    },
                    }}
                
                    
                >
                    <Container style={{
                      // backgroundColor: 'black', opacity: '0.6', height: '50px'
                      }}>
                <Typography style={{padding: '10px', color: "black" }}>{openDialog.body}</Typography>
                </Container>
                
                
              </Dialog>
            
            <Grid container direction="row" justify="" alignItems="center"style={{paddingLeft: '20px',paddingTop: '15px',paddingBottom: '15px',paddingRight: '20px', backgroundColor: 'white'}}>
                <Grid item xs={4}>  
                <Link to="../profile">
                <ArrowBackIosIcon style={{fontSize:'20px', color:'black'}} />
                </Link>
                
                                
                 </Grid>
                 <Grid item xs={4}>                    
                <Typography align="center" style={{color: 'black'}}>Red Envelope History</Typography>
                 </Grid>
            </Grid>
            <TableContainer >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center" style={{ fontWeight: 'bold'}}>Code</TableCell>
              <TableCell align="center" style={{fontWeight: 'bold'}}>Amount</TableCell>
              <TableCell align="center" style={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell style={{ fontWeight: 'bold'}}>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody >
            {envelop && envelop.map(row => (
              <TableRow key={row.name} >
              <TableCell align='center' component="th" scope="row" style={{ paddingTop: '8px',fontSize: '10px'}}>
                {row.id}
              </TableCell>
              <TableCell align="center" style={{ paddingTop: '5px'}}>{row.amount}</TableCell>
              {(row.expired) ? 
               <TableCell align="center" style={{ color: 'red' , fontWeight: 'bold',paddingTop: '8px'}}>Claimed</TableCell>

               : <TableCell align="center" style={{color: 'green' , fontWeight: 'bold',paddingTop: '8px' }}>Active</TableCell>

            }
              <TableCell style={{ paddingTop: '8px'}}>
                {
                    !row.expired ?
                    <div>
                         <Button onClick={(e)=>handleSubmit(e,row.id)} variant="contained" style={{backgroundColor: 'green',color: 'white'}}>
                    Redeem
                    </Button>
                    <Container style={{height: '10px'}}></Container>
                    <Button onClick={e=>copy(e,row.id)} variant="contained" style={{backgroundColor: 'blue',color: 'white'}}>
                Copy
                </Button>
                    </div>
                    :<Container></Container> 
                }
                    
                
              
                
               
                
             
              </TableCell>
            </TableRow>
            ))}
            
          </TableBody>
        </Table>
      </TableContainer>
           

           
            
        
            
           

            
        </div>
    )
}

export default RedEnvelopHistory ; 
