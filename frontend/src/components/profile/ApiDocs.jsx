import React, { useMemo } from "react";
import { Box, Button, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { useHistory } from "react-router-dom";
import * as api from "../../api/auth";

const useStyles = makeStyles(() => ({
  page: {
    minHeight: "100vh",
    backgroundColor: "#F1F5F9",
    display: "flex",
    justifyContent: "center",
    paddingBottom: "calc(60px + env(safe-area-inset-bottom))",
  },
  frame: {
    width: "100%",
    maxWidth: 500,
    minHeight: "100vh",
    backgroundColor: "#fff",
  },
  header: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    background: "#fff",
    borderBottom: "1px solid #E5E7EB",
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  title: { fontWeight: 900, color: "#0F172A", fontSize: 16 },
  muted: { color: "#64748B", fontSize: 12 },
  body: { padding: 14 },
  card: {
    border: "1px solid #E5E7EB",
    background: "#fff",
    padding: 12,
    marginBottom: 12,
  },
  code: {
    marginTop: 10,
    background: "#0B1220",
    color: "#E5E7EB",
    padding: "10px 10px",
    fontSize: 12,
    lineHeight: 1.4,
    overflowX: "auto",
    whiteSpace: "pre",
  },
  pillRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  pill: {
    fontSize: 11,
    padding: "4px 8px",
    border: "1px solid #E5E7EB",
    background: "#F8FAFC",
    color: "#0F172A",
  },
}));

function Code({ children }) {
  const classes = useStyles();
  return <pre className={classes.code}>{children}</pre>;
}

export default function ApiDocs() {
  const classes = useStyles();
  const history = useHistory();
  const baseUrl = useMemo(() => api.url || "", []);

  return (
    <div className={classes.page}>
      <div className={classes.frame}>
        <div className={classes.header}>
          <div>
            <Typography className={classes.title}>API Docs</Typography>
            <Typography className={classes.muted}>
              Base URL: <b>{baseUrl || "(not set)"}</b>
            </Typography>
          </div>
          <Button variant="outlined" size="small" onClick={() => history.push("/profile")}>
            Back
          </Button>
        </div>

        <div className={classes.body}>
          <Paper elevation={0} className={classes.card}>
            <Typography style={{ fontWeight: 900, color: "#0F172A" }}>Auth</Typography>
            <Typography className={classes.muted} style={{ marginTop: 6 }}>
              User JWT is stored in localStorage as <b>user</b>. Most user APIs require:
              <b> Authorization: Bearer &lt;token&gt;</b>
            </Typography>
            <Code>{`// Example (frontend)
const user = JSON.parse(localStorage.getItem("user") || "{}");
const token = user?.token;
const headers = token ? { Authorization: "Bearer " + token } : {};
`}</Code>
          </Paper>

          <Paper elevation={0} className={classes.card}>
            <Typography style={{ fontWeight: 900, color: "#0F172A" }}>Games Catalog (Home UI)</Typography>
            <Typography className={classes.muted} style={{ marginTop: 6 }}>
              Home page games are loaded from MongoDB using this public endpoint (only
              <b> enabled</b> games are returned).
            </Typography>
            <div className={classes.pillRow}>
              <span className={classes.pill}>GET /gamesCatalog</span>
              <span className={classes.pill}>Public</span>
            </div>
            <Code>{`curl "${baseUrl}/gamesCatalog"

// Response
{
  "success": true,
  "games": [
    {
      "_id": "...",
      "key": "9wickets",
      "name": "9WICKETS",
      "category": "sports",
      "type": "featured",
      "enabled": true,
      "sortOrder": 0,
      "badge": "",
      "logoUrl": "",
      "charImageUrl": "",
      "backgroundUrl": "",
      "onClickPath": "/cricket",
      "externalUrl": ""
    }
  ]
}`}</Code>
          </Paper>

          <Paper elevation={0} className={classes.card}>
            <Typography style={{ fontWeight: 900, color: "#0F172A" }}>Master Admin (Games Manager)</Typography>
            <Typography className={classes.muted} style={{ marginTop: 6 }}>
              Admin APIs are protected by <b>AdminAPI</b> (from backend <b>config.env</b>).
              In the admin panel it is stored as <b>MASTER_ADMIN_API</b>.
            </Typography>
            <div className={classes.pillRow}>
              <span className={classes.pill}>GET /gamesCatalogAdmin/:api</span>
              <span className={classes.pill}>POST /gamesCatalogAdmin/:api</span>
              <span className={classes.pill}>PUT /gamesCatalogAdmin/:id/:api</span>
              <span className={classes.pill}>DELETE /gamesCatalogAdmin/:id/:api</span>
            </div>
            <Code>{`# List all (enabled + disabled)
curl "${baseUrl}/gamesCatalogAdmin/ADMIN_API_KEY"

# Create
curl -X POST "${baseUrl}/gamesCatalogAdmin/ADMIN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Lucky Sports",
    "category": "sports",
    "type": "grid",
    "enabled": true,
    "sortOrder": 1,
    "logoUrl": "https://.../logo.png",
    "charImageUrl": "https://.../athlete.png",
    "backgroundUrl": "https://.../bg.png",
    "onClickPath": "/cricket"
  }'

# Update (toggle visibility)
curl -X PUT "${baseUrl}/gamesCatalogAdmin/GAME_ID/ADMIN_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{ "enabled": false }'

# Delete
curl -X DELETE "${baseUrl}/gamesCatalogAdmin/GAME_ID/ADMIN_API_KEY"`}</Code>
          </Paper>

          <Paper elevation={0} className={classes.card}>
            <Typography style={{ fontWeight: 900, color: "#0F172A" }}>User APIs used by UI</Typography>
            <div className={classes.pillRow}>
              <span className={classes.pill}>GET /getNotice</span>
              <span className={classes.pill}>GET /getUser/:id (Auth)</span>
              <span className={classes.pill}>GET /getUserHome/:id (Auth)</span>
            </div>
            <Code>{`# Notice (public)
curl "${baseUrl}/getNotice"

# Get user data (requires Authorization header)
curl "${baseUrl}/getUser/USER_ID" \\
  -H "Authorization: Bearer USER_JWT_TOKEN"

# Home user data (requires Authorization header)
curl "${baseUrl}/getUserHome/USER_ID" \\
  -H "Authorization: Bearer USER_JWT_TOKEN"`}</Code>
          </Paper>

          <Typography className={classes.muted} style={{ textAlign: "center", padding: "10px 0 18px" }}>
            Note: Full backend routes are in <b>backend/router/routes.js</b>.
          </Typography>
        </div>
      </div>
    </div>
  );
}

