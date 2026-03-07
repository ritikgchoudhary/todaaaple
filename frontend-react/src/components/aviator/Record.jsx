import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  Typography
} from "@material-ui/core";

const AviatorRecord = ({record}) => {
  
  return (
    <div style={{paddingBottom: '100px'}}>
      <TableContainer >
        <Table aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center" style={{ color: "#dbdbdb",}}>Period</TableCell>
              <TableCell align="center" style={{ color: "#dbdbdb" }}>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody >
            {record && record.map(row => (
              <TableRow key={row.id} >
              <TableCell align='center' component="th" scope="row" style={{ paddingTop: '8px'}}>
                {row.id}
              </TableCell>
              
              <TableCell  style={{ paddingTop: '16px'}}>
              <Container align="center"
                    style={{
                      
                      borderRadius: '5px',
                      backgroundColor:
                        row.number <= 1.5
                          ? "red"
                          : row.number <= 2
                          ? "orange"
                          : row.number <= 5
                          ? "#28c04c"
                          : "#8c6ceb",
                      width: '80px'    
                     
                
                     
                    }}
                  >
                    <Typography  style={{fontSize: '13px',color: 'white'}}>{row.number}x</Typography>
                  </Container>
                
              </TableCell>
            </TableRow>
            ))}
            
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AviatorRecord;
