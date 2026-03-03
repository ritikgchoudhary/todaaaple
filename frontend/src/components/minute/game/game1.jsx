import React from "react";
import { useParams, useHistory } from "react-router-dom";
import { Typography, Button, Box } from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  back: { marginBottom: 24 },
}));

export default function NewGamePage() {
  const classes = useStyles();
  const { id } = useParams();
  const history = useHistory();

  return (
    <div className={classes.root}>
      <Button className={classes.back} startIcon={<ArrowBackIosIcon />} onClick={() => history.push("/")}>
        Back
      </Button>
      <Typography variant="h6">Wingo Game</Typography>
      <Typography color="textSecondary">Game ID: {id}</Typography>
      <Box mt={2}>
        <Typography variant="body2" color="textSecondary">
          This game screen can be implemented here.
        </Typography>
      </Box>
    </div>
  );
}
