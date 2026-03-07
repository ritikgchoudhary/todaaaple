import { Paper, Grid, Typography, List, ListItem, ListItemAvatar, Container, Dialog, DialogContent, DialogTitle, IconButton } from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import React, { useState } from 'react'

const MinutesBidHistory = ({bidHistory}) => {
    const [selectedBid, setSelectedBid] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    const handleBidClick = (bid) => {
        setSelectedBid(bid);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedBid(null);
    };

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
                        <Typography style={{fontSize: 13}}>Period:</Typography>
                        <Typography style={{fontSize: 13}}>Status:</Typography>
                        <Typography style={{fontSize: 13}}>Open Price:</Typography>
                        <Typography style={{fontSize: 13}}>Result:</Typography>
                    </Grid>
                    <Grid item>
                        <Typography style={{fontWeight: "bold", fontSize: 13}}>{bidHistory.period}</Typography>
                        <Typography style={{fontWeight: "bold",color: bidHistory.status === 'Pending' ? 'black' :bidHistory.status === 'Success' ?"#28c04c":"red", fontSize: 13}}>{bidHistory.status}</Typography>
                        <Typography style={{fontWeight: "bold", fontSize: 13}}>{bidHistory.openPrice}</Typography>
                        <Typography style={{fontWeight: "bold", fontSize: 13}}>{bidHistory.result}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography style={{fontSize: 13}}>Select:</Typography>
                        <Typography style={{fontSize: 13}}>Delivery:</Typography>
                        <Typography style={{fontSize: 13}}>Fee:</Typography>
                        <Typography style={{fontSize: 13}}>Winning:</Typography>
                    </Grid>
                    <Grid item>
                        <Typography style={{fontWeight: "bold",color: bidHistory.select.includes('Green') ? '#28c04c' :bidHistory.select.includes('Red') ?"red": bidHistory.select.includes('Violet') ? '#8c6ceb': '#2196f3', fontSize: 13}}>{bidHistory.select}</Typography>
                        <Typography style={{fontWeight: "bold", fontSize: 13}}>{bidHistory.amount - (bidHistory.amount * 2)/100 }</Typography>
                        <Typography style={{fontWeight: "bold", fontSize: 13}}>{(bidHistory.amount * 2)/100 }</Typography>
                        <Typography style={{fontWeight: "bold",color: bidHistory.status === 'Success'? '#28c04c': 'red', fontSize: 13}}>{bidHistory.winning}</Typography>
                    </Grid>

                </Grid>
               


            </Paper>
           
             
             ))}
            
        
        </div>
    )
}

export default MinutesBidHistory
