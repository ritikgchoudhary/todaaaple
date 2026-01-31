import { Paper, Grid, Typography, Container} from '@material-ui/core'
import React from 'react'

const BidHistory = ({bidHistory, game}) => {
    

    return (
        <div>
             
            {(bidHistory == null || !bidHistory.map) ? <Grid container justify="center" alignItems="center" style={{minHeight: '150px'}}>
                <Grid item>
                    <Typography>No Records</Typography>
                </Grid>
            </Grid> : 
            bidHistory && bidHistory.map && bidHistory.map(bidHistory => 
                (
                    <Paper
                    style={{
                      backgroundColor: "white",
                      marginLeft: "15px",
                      marginRight: "15px",
                      marginTop: "10px",
                      marginBottom: "5px",
                      paddingLeft: "10px",
                      paddingTop: "10px",
                      paddingBottom: "10px",
                    }} key={bidHistory.id}
                  >
                    <Grid container direction="row" justifyContent="space-between" alignItems='center'>

                      <Grid item>
                      <Typography style={{ color: "black", fontSize: "12px" }}>
                          {new Date(bidHistory.date).toLocaleString()}
                        </Typography>
                        <Typography style={{ color: "black", fontSize: "12px" }}>
                          Your Bid: ₹{bidHistory.amount}
                        </Typography>
                        <Typography style={{ color: "black", fontSize: "12px" }}>
                          Fee: ₹{bidHistory.amount * 2/100}
                        </Typography>
                        <Typography style={{ color: "black", fontSize: "12px" }}>
                          Period: {bidHistory.period}
                        </Typography>
                      </Grid>
                      <Grid item>
                      <Typography style={{ color: "black", fontSize: "10px", paddingRight: '10px'}}>
                          Result: {bidHistory.result}x
                        </Typography>
                        <Container style={{borderTopLeftRadius: '10px',borderBottomLeftRadius: '10px', backgroundColor:  bidHistory.winning > 0 ? "green" : 'red'}}>
                        <Typography
                          align="center"
                          style={{ color: "white", fontSize: "14px" }}
                        >
                          {bidHistory.winning > 0 ? 'Profit' : 'Loss'}
                        </Typography>
                        <Typography
                          style={{
                            color: 'white',
                            fontSize: "15px",
                            fontWeight: "bold",
                          }}
                        >
                          ₹{bidHistory.winning > 0 ? (bidHistory.winning).toFixed(2) : (bidHistory.amount)}
                        </Typography>
                        </Container>
                        {bidHistory.stopOn ? 
                        <Typography style={{ color: "black", fontSize: "10px",paddingRight: '10px'}}>
                          Stop: {(bidHistory.stopOn).toFixed(2)}x
                        </Typography> : null}
                      </Grid>
                    </Grid>
                    
                  </Paper>
             
             ))}
            
        
        </div>
    )
}

export default BidHistory
