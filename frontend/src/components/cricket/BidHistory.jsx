import { Paper, Grid, Typography, Container} from '@material-ui/core'
import React from 'react'

const CricketBidHistory = ({bidHistory,userId,level}) => {
    
    return (
        <div>
             
            {(bidHistory == null || !bidHistory.map) ? <Grid container justify="center" alignItems="center" style={{minHeight: '150px'}}>
                <Grid item>
                    <Typography>No Records</Typography>
                </Grid>
            </Grid> : 
            bidHistory &&   bidHistory.map && bidHistory.map((data,index) => {
              
              return  data.bid[`${userId}`][`${level}`] ? <Paper
              style={{
                backgroundColor: "white",
                marginLeft: "15px",
                marginRight: "15px",
                marginTop: "10px",
                marginBottom: "5px",
                paddingLeft: "10px",
                paddingTop: "10px",
                paddingBottom: "10px",
              }} key={index}
            >
              <Grid container direction="row" justifyContent="space-evenly" alignItems='center'>
               <Grid item>
                <Typography style={{fontSize: '12px'}}>Match ID</Typography>
                <Typography style={{color: 'black',fontSize: '12px',fontWeight: 'bold'}}>{data?.matchId??''}</Typography>
             
               </Grid>
               {level === 'history' ?
               <Grid item>
               <Typography style={{fontSize: '12px'}}>Profit</Typography>
                <Typography style={{color: data?.bid[`${userId}`]?.winning??0 > 0 ? 'green' : 'red',fontSize: '12px',fontWeight: 'bold'}}>₹{data?.bid[`${userId}`]?.winning?.toFixed(0)??0}</Typography>
             
               </Grid>: <></>}
               {level === 'history' ?
               <Grid item>
               <Typography style={{fontSize: '12px'}}>EXP</Typography>
                <Typography style={{color: 'red',fontSize: '12px',fontWeight: 'bold'}}>{((data?.bid[`${userId}`]?.exp?.match??0) + (data?.bid[`${userId}`]?.exp?.book??0))?.toFixed(0)??'0'}</Typography>
             
               </Grid> : <></>}
               
              </Grid>

              {data && data.bid[`${userId}`][`${level}`] &&  data.bid[`${userId}`][`${level}`].map && data.bid[`${userId}`][`${level}`].map((history,index) => {

               return <Grid container direction="row" justifyContent="space-between" alignItems='center'  key={index}>
               
               <Grid item xs={9}>
               <Typography style={{ color: "red", fontSize: "12px" }}>
                   {history?.type?.toUpperCase()??''}
                 </Typography>
               <Typography style={{ color: "black", fontSize: "12px" }}>
                   {new Date(history.date).toLocaleString()}
                 </Typography>
                 <Typography style={{ color: "black", fontSize: "12px" }}>
                   Your Bid: ₹{history.amount}
                 </Typography>
                 <Typography style={{ color: "black", fontSize: "12px" }}>
                   Market ODD: {history.market}
                 </Typography>
                 <Typography style={{ color: "black", fontSize: "12px" }}>
                   Bet on: {history.bid}
                 </Typography>
                 
               </Grid>
               <Grid item xs={3}>
               
                 <Container style={{borderTopLeftRadius: '10px',borderBottomLeftRadius: '10px', backgroundColor:  history.states === 'Pending' ? "#0c93ed" : history.states === 'Success' ? 'green' : 'red'}}>
                 <Typography
                   align="center"
                   style={{ color: "white", fontSize: "14px" }}
                 >
                   {history.states}
                 </Typography>
                 {
                  level !== 'history' ?<Typography align='center'
                  style={{
                    color: 'white',
                    fontSize: "15px",
                    fontWeight: "bold",
                  }}
                >
                  ₹{history.winning > 0 ? (history.winning).toFixed(2) : (history.amount)}
                </Typography> : <div></div>
                 }
                 
                
                 </Container>
                
               </Grid>
             </Grid>
              })}
              
              
            </Paper> : <div></div>
            })
                
          }
            
        
        </div>
    )
}

export default CricketBidHistory
