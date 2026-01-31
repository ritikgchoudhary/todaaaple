import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Avatar
} from "@material-ui/core";

const BconeRecord = ({record}) => {
  
  return (
    <div>
      <TableContainer >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center" style={{ color: "#dbdbdb",}}>Period</TableCell>
              <TableCell align="center" style={{ color: "#dbdbdb"}}>Price</TableCell>
              <TableCell align="center" style={{ color: "#dbdbdb" }}>Number</TableCell>
              <TableCell style={{ color: "#dbdbdb" }}>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody >
            {record && record.map(row => (
              <TableRow key={row.name} >
              <TableCell align='center' component="th" scope="row" style={{ paddingTop: '8px'}}>
                {row.id}
              </TableCell>
              <TableCell align="center" style={{ paddingTop: '5px'}}>{row.price2}</TableCell>
              {(row.color2.toLowerCase() === "red violet") ? 
               <TableCell align="center" style={{ color: 'red' , fontWeight: 'bold',paddingTop: '8px'}}>{row.number2}</TableCell>

               : row.color2.toLowerCase() === "green violet" ? <TableCell align="center" style={{color: '#28c04c' , fontWeight: 'bold',paddingTop: '8px' }}>{row.number2}</TableCell>
               : <TableCell align="center" style={{ color: row.color2 === 'Green' ? '#28c04c' : row.color2 , fontWeight: 'bold',paddingTop: '8px' }}>{row.number2}</TableCell>

            }
              <TableCell style={{ paddingTop: '8px'}}>
                {(row.color2.toLowerCase() === "red violet") ? (
                  <Grid container direction="row" alignItems='center' justify="flex-start">
                    <Grid item>
                    <Avatar style={{backgroundColor: 'red', height: '15px', width: '15px', marginRight: '2px'}}> </Avatar>
                    </Grid>
                    <Grid item>
                    <Avatar style={{backgroundColor: '#8c6ceb', height: '15px', width: '15px'}}> </Avatar>
                    </Grid>
                  </Grid>
                ) : row.color2.toLowerCase() === "green violet" ? <Grid container direction="row" alignItems='center' justify='flex-start'>
                <Grid item >
                <Avatar style={{backgroundColor: '#28c04c', height: '15px', width: '15px', marginRight: '2px'}}> </Avatar>
                </Grid>
                <Grid item>
                <Avatar style={{backgroundColor: '#8c6ceb', height: '15px', width: '15px'}}> </Avatar>
                </Grid>
              </Grid> :
                 
                <Avatar style={{backgroundColor:  row.color2 === 'Green' ? '#28c04c' : row.color2, height: '15px', width: '15px'}}> </Avatar>}
                
              </TableCell>
            </TableRow>
            ))}
            
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default BconeRecord;
