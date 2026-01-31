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

const BigSmallRecord = ({record}) => {
  
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
              <TableCell align="center" style={{ paddingTop: '5px'}}>{row.price}</TableCell>
              {(row.color.toLowerCase() === "red violet") ? 
               <TableCell align="start" style={{ color: 'red' , fontWeight: 'bold',paddingTop: '8px'}}>{`${row.number} ${row.number >= 5 ? 'Big' : 'Small'}`}</TableCell>

               : row.color.toLowerCase() === "green violet" ? <TableCell align="start" style={{color: '#28c04c' , fontWeight: 'bold',paddingTop: '8px' }}>{`${row.number} ${row.number >= 5 ? 'Big' : 'Small'}`}</TableCell>
               : <TableCell align="start" style={{ color: row.color === 'Green' ? '#28c04c' : row.color , fontWeight: 'bold',paddingTop: '8px' }}>{`${row.number} ${row.number >= 5 ? 'Big' : 'Small'}`}</TableCell>

            }
              <TableCell style={{ paddingTop: '8px'}}>
                {(row.color.toLowerCase() === "red violet") ? (
                  <Grid container direction="row" alignItems='center' justify="flex-start">
                    <Grid item>
                    <Avatar style={{backgroundColor: 'red', height: '15px', width: '15px', marginRight: '2px'}}> </Avatar>
                    </Grid>
                    <Grid item>
                    <Avatar style={{backgroundColor: '#8c6ceb', height: '15px', width: '15px'}}> </Avatar>
                    </Grid>
                  </Grid>
                ) : row.color.toLowerCase() === "green violet" ? <Grid container direction="row" alignItems='center' justify='flex-start'>
                <Grid item >
                <Avatar style={{backgroundColor: '#28c04c', height: '15px', width: '15px', marginRight: '2px'}}> </Avatar>
                </Grid>
                <Grid item>
                <Avatar style={{backgroundColor: '#8c6ceb', height: '15px', width: '15px'}}> </Avatar>
                </Grid>
              </Grid> :
                 
                <Avatar style={{backgroundColor:  row.color === 'Green' ? '#28c04c' : row.color, height: '15px', width: '15px'}}> </Avatar>}
                
              </TableCell>
            </TableRow>
            ))}
            
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default BigSmallRecord;
