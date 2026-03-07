// import { Paper, Grid, Typography, List,ListItem,ListItemAvatar,Avatar,ListItemText, Container} from '@material-ui/core'
// import React from 'react'

// const MinutesBidHistory = ({bidHistory, game}) => {
    

//     return (
//         <div> 
             
//             {(bidHistory == null || !bidHistory.map) ? <Grid container justify="center" alignItems="center" style={{minHeight: '150px'}}>
//                 <Grid item>
//                     <Typography style={{color: 'white'}}>No Records</Typography>
//                 </Grid>
//             </Grid> : 
//             bidHistory && bidHistory.map && bidHistory.map(bidHistory => 
//                 (
//                bidHistory.game === game ? 
//             <Paper style={{marginTop: '10px',backgroundColor: '#966587'}}>
//                  <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
//       <ListItem>
//         <ListItemAvatar>
//           <Container style={{height: '40px',color: 'white', borderRadius: '10px',alignContent: 'center',backgroundColor: bidHistory.select.includes('Green') ? '#52AE66' : bidHistory.select.includes('Red') ? '#a30d18' : bidHistory.select.includes('Violet') ? '#5f47a6' : '#2196f3'}}>
//             <Typography>{bidHistory.select}</Typography>
//           </Container>
//         </ListItemAvatar>
//         <ListItem>
//         <Grid container direction="column" alignItems='center' justify='space-between'>
 
//         <Grid container direction="row" alignItems='center' justify='space-between'>
//            <Grid item>
// <Typography style={{color: 'white',fontSize: '14px'}}>{bidHistory.period}</Typography>
//            </Grid>
//            <Grid item>
//             <Container style={{borderRadius: '8px', border: '2px solid', color: bidHistory.status === 'Success' ? '#52AE66': bidHistory.status === 'Fail'? '#a30d18':'white', borderColor: bidHistory.status === 'Success' ? '#52AE66': bidHistory.status === 'Fail'? '#a30d18':'white'}}>
//             <Typography>{bidHistory.status}</Typography>

//             </Container>
//            </Grid>
//         </Grid>
//         <Grid container direction="row" alignItems='center' justify='space-between'>
//            <Grid item>
// <Typography style={{color: 'white',fontSize: '10px'}}>{new Date(bidHistory.date).toLocaleString()}</Typography>
//            </Grid>
//            <Grid item>
//             <Typography style={{fontWeight: 'bold',fontSize:'18px',color: bidHistory.status === 'Success' ? '#52AE66': bidHistory.status === 'Fail'? '#a30d18':'white'}}>{bidHistory.winning > 0 ? `+${bidHistory.winning}` : bidHistory.status === 'Pending' ? `⏱️${bidHistory.amount}` :`-${bidHistory.amount}`}</Typography>

//            </Grid>
//         </Grid>
//         </Grid>

//         </ListItem>
//       </ListItem>
      
     
//     </List>
//                  </Paper>
//              : null
             
//              ))}
            
        
//         </div>
//     )
// }

// export default MinutesBidHistory
