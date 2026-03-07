import { Paper, Grid, Typography} from '@material-ui/core'
import React from 'react'

const PlayHistory = ({bidHistory}) => {
    

    return (
        <div>
             
            {(bidHistory == null || !bidHistory.map) ? <Grid container justify="center" alignItems="center" style={{minHeight: '150px'}}>
                <Grid item>
                    <Typography>No Records</Typography>
                </Grid>
            </Grid> : 
            bidHistory && bidHistory.map && bidHistory.map(bidHistory => 
                (
                    <Paper style={{marginTop: '10px', padding: '10px'}}>
                
                    <Grid container direction="row" justify='space-between'>
                        <Grid item>
                            <Typography style={{fontWeight: 'bold'}}>₹{bidHistory.amount}</Typography>
                            <Typography style={{fontSize: '11px'}}>CONTRACTMONEY</Typography>
                        </Grid>
                        <Grid item>
                            <Typography style={{fontSize: 14}}>{new Date(bidHistory.date).toLocaleString()}</Typography>
                        </Grid>
    
                    </Grid>
                    <Grid container direction="row" alignItems='center' justify='space-evenly' style={{marginTop: '20px'}}>
                        <Grid item>
                            <Typography style={{fontSize: 13}}>Id:</Typography>
                            <Typography style={{fontSize: 13}}>Status:</Typography>
                            <Typography style={{fontSize: 13}}>Mines:</Typography>
                            
                        </Grid>
                        <Grid item>
                            <Typography style={{fontWeight: "bold", fontSize: 13}}>{bidHistory.id}</Typography>
                            <Typography style={{fontWeight: "bold",color: bidHistory.status === 'OnGoing'  ? 'Orange'  : bidHistory.status === 'Won' ||bidHistory.status === 'Cashout' ? "#28c04c" : "red", fontSize: 13}}>{bidHistory.status}</Typography>
                            <Typography style={{fontWeight: "bold", fontSize: 13}}>{bidHistory.states.size}x{bidHistory.states.mines}</Typography>
                        </Grid>
                        <Grid item>
                            
                            <Typography style={{fontSize: 13}}>Delivery:</Typography>
                            <Typography style={{fontSize: 13}}>Fee:</Typography>
                            <Typography style={{fontSize: 13}}>Winning:</Typography>
                        </Grid>
                        <Grid item>
                            <Typography style={{fontWeight: "bold", fontSize: 13}}>{bidHistory.amount - (bidHistory.amount * 2)/100 }</Typography>
                            <Typography style={{fontWeight: "bold", fontSize: 13}}>{(bidHistory.amount * 2)/100 }</Typography>
                            <Typography style={{fontWeight: "bold",color: bidHistory.status === 'Cashout' || bidHistory.status === 'Won' ? '#28c04c': bidHistory.status === 'OnGoing' ? 'orange' : 'red', fontSize: 13}}>{bidHistory.states.winning.toFixed(2)}</Typography>
                        </Grid>
    
                    </Grid>
                   
    
    
                </Paper>
             
             ))}
            
        
        </div>
    )
}

export default PlayHistory
