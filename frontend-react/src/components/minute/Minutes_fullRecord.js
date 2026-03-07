import React, { useEffect, useState } from "react";
import { Typography, Grid, Box } from "@material-ui/core";
import ArrowBackIosIcon from "@material-ui/icons/ArrowBackIos";
import Record from "./Minutes_Record.jsx";
import axios from "axios";
import { useHistory } from "react-router-dom";
import * as api from "../../api/auth.js";
import { useParams } from "react-router-dom";

const MinutesFullRecord = () => {
  const URL = api.url;
  const params = useParams();
  const history = useHistory();
  const [isAuth, setAuth] = useState(false);
  const [record, setRecord] = useState();

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setAuth(foundUser);
    } else {
      window.location.replace("/login");
    }
  }, []);

  useEffect(() => {
    axios
      .get(`${URL}/minute${params.id}_getFullRecord/`)
      .then((response) => setRecord(response.data))
      .catch((error) => console.log(error));
  }, [params.id, URL]);

  return (
    <Box
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        paddingBottom: "calc(24px + env(safe-area-inset-bottom))",
      }}
    >
      <Box
        style={{
          maxWidth: 500,
          margin: "0 auto",
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#fff",
          boxShadow: "0 0 24px rgba(0,0,0,0.06)",
        }}
      >
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 16px",
            paddingTop: "calc(14px + env(safe-area-inset-top))",
            background: "linear-gradient(135deg, #0F766E 0%, #115E59 100%)",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
          }}
        >
          <Box
            onClick={history.goBack}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 44,
              minHeight: 44,
              marginLeft: -8,
              cursor: "pointer",
            }}
            aria-label="Go back"
          >
            <ArrowBackIosIcon style={{ fontSize: 20, color: "white" }} />
          </Box>
          <Typography
            align="center"
            style={{
              color: "white",
              fontSize: 17,
              fontWeight: 700,
              flex: 1,
            }}
          >
            {params.id} Minutes Record
          </Typography>
          <Box style={{ minWidth: 44 }} />
        </Box>

        <Box
          style={{
            padding: "0 12px 16px",
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Record record={record} fullPage />
        </Box>
      </Box>
    </Box>
  );
};

export default MinutesFullRecord; 
