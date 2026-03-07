import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
} from "@material-ui/core";

const tableStyles = {
  container: { padding: "0 0 4px", marginTop: 8 },
  table: { minWidth: 260 },
  headCell: {
    color: "#64748B",
    fontWeight: 600,
    fontSize: 12,
    borderBottom: "2px solid #E2E8F0",
    padding: "12px 8px",
  },
  bodyCell: {
    borderBottom: "1px solid #F1F5F9",
    padding: "10px 8px",
    fontSize: 13,
  },
  numberBig: { color: "#16A34A", fontWeight: 700, fontSize: 13 },
  numberSmall: { color: "#DC2626", fontWeight: 700, fontSize: 13 },
  resultDot: {
    height: 14,
    width: 14,
    minWidth: 14,
    borderRadius: "50%",
    flexShrink: 0,
  },
  resultWrap: { display: "flex", justifyContent: "center", alignItems: "center", width: "100%", gap: 6 },
};

const COLORS = {
  red: "#f84350",
  green: "#28c04c",
  violet: "#8c6ceb",
  grey: "#94a3b8",
};

const Minutes_Record = ({ record, fullPage }) => {
  const isBig = (num) => num >= 5;
  const getNumberStyle = (row) => {
    const big = isBig(row.number);
    return big ? tableStyles.numberBig : tableStyles.numberSmall;
  };

  const containerStyle = fullPage
    ? { ...tableStyles.container, padding: "12px 0 8px", marginTop: 4 }
    : tableStyles.container;

  return (
    <div style={containerStyle}>
      <TableContainer style={fullPage ? { overflowX: "auto", WebkitOverflowScrolling: "touch" } : undefined}>
        <Table aria-label="game record" style={tableStyles.table} size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center" style={tableStyles.headCell}>Period</TableCell>
              <TableCell align="center" style={tableStyles.headCell}>Price</TableCell>
              <TableCell align="center" style={tableStyles.headCell}>Number</TableCell>
              <TableCell align="center" style={tableStyles.headCell}>Result</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {record && record.map((row, idx) => (
              <TableRow key={row.id != null ? row.id : idx}>
                <TableCell align="center" component="th" scope="row" style={tableStyles.bodyCell}>
                  {row.id}
                </TableCell>
                <TableCell align="center" style={tableStyles.bodyCell}>{row.price}</TableCell>
                <TableCell align="center" style={{ ...tableStyles.bodyCell, ...getNumberStyle(row) }}>
                  {`${row.number} ${isBig(row.number) ? "Big" : "Small"}`}
                </TableCell>
                <TableCell align="center" style={tableStyles.bodyCell}>
                  <Box style={tableStyles.resultWrap}>
                    {row.color && row.color.toLowerCase() === "red violet" ? (
                      <>
                        <Box style={{ ...tableStyles.resultDot, backgroundColor: COLORS.red }} />
                        <Box style={{ ...tableStyles.resultDot, backgroundColor: COLORS.violet }} />
                      </>
                    ) : row.color && row.color.toLowerCase() === "green violet" ? (
                      <>
                        <Box style={{ ...tableStyles.resultDot, backgroundColor: COLORS.green }} />
                        <Box style={{ ...tableStyles.resultDot, backgroundColor: COLORS.violet }} />
                      </>
                    ) : (
                      <Box
                        style={{
                          ...tableStyles.resultDot,
                          backgroundColor: row.color === "Green" ? COLORS.green : (row.color === "Red" ? COLORS.red : COLORS.grey),
                        }}
                      />
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Minutes_Record;
