import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { encryptData, decryptData } from "../../utils/encryption";
import { Check, Clear } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import PostgresLogoIcon from "../../images/postgres_logo.png";

const { ipcRenderer } = window.require("electron");

export default function PostgresForm({ dataObj }) {
  const [postgresHostName, setPostgresHostName] = useState("localhost");
  const [postgresDBName, setPostgresDBName] = useState("");
  const [postgresPort, setPostgresPort] = useState("5432");
  const [postgresUsername, setPostgresUsername] = useState("");
  const [postgresPassword, setPostgresPassword] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [formDataLoaded, setFormDataLoaded] = useState(false);
  const [isPostgresConnected, setIsPostgresConnected] = useState(null); // Use null initially for an undetermined state

  function handleFormSubmit(event) {
    event.preventDefault();
  }

  // Load the saved form data from localStorage on component mount
  useEffect(() => {
    if (!formDataLoaded) {
      const savedFormData = localStorage.getItem("postgresFormData");
      if (savedFormData) {
        const decryptedData = decryptData(savedFormData); // Decrypt the data
        if (decryptedData) {
          setPostgresHostName(decryptedData.hostname);
          setPostgresDBName(decryptedData.dbname);
          setPostgresPort(decryptedData.port);
          setPostgresUsername(decryptedData.username);
          setPostgresPassword(decryptedData.password);
        }
        setFormDataLoaded(true);
      } else {
        setFormDataLoaded(true);
      }
    }
  }, [formDataLoaded]);

  // Save the form data to localStorage whenever it changes
  useEffect(() => {
    const formData = {
      db: "PostgreSQL",
      hostname: postgresHostName,
      dbname: postgresDBName,
      port: postgresPort,
      username: postgresUsername,
      password: postgresPassword,
    };
    if (formDataLoaded) {
      const encryptedData = encryptData(formData); // Encrypt the data
      localStorage.setItem("postgresFormData", encryptedData);
    }
  }, [
    postgresHostName,
    postgresDBName,
    postgresPort,
    postgresUsername,
    postgresPassword,
    formDataLoaded,
  ]);

  async function testDBConnection(event) {
    event.preventDefault();
    setIsTesting(true);
    let dbObj = {
      db: "PostgreSQL",
      hostname: postgresHostName,
      dbname: postgresDBName,
      port: postgresPort,
      username: postgresUsername,
      password: postgresPassword,
    };

    // Call the main process function via ipcRenderer
    const isPostgresConnected = await ipcRenderer.invoke(
      "testDBConnection",
      dbObj
    );
    // Update the state with the connection status
    setIsPostgresConnected(isPostgresConnected);
    setIsTesting(false);
  }

  return (
    <Paper elevation={3}>
      <Box sx={{ textAlign: "center", paddingTop: "30px" }}>
        <img width={"70px"} src={PostgresLogoIcon} alt="postgresql logo" />
        {/* <h3>PostgreSQL Database Credentials</h3> */}
      </Box>
      <Box sx={{ display: "block", marginTop: "10px", textAlign: "center" }}>
        {isTesting ? (
          // If testing is in progress, show the CircularProgress
          <CircularProgress />
        ) : isPostgresConnected === null ? null : isPostgresConnected ? ( // If connection status is null, show nothing (undetermined)
          // If connection is successful, show the green check icon
          <Typography>
            <Check style={{ color: "green", marginRight: "5px" }} />
            <br />
            Connected to PostgreSQL!
          </Typography>
        ) : (
          // If connection fails, show the red x icon
          <Typography>
            <Clear style={{ color: "red", marginRight: "5px" }} />
            <br />
            Failed to connect to PostgreSQL!
          </Typography>
        )}
      </Box>
      <Box
        component="form"
        onSubmit={handleFormSubmit}
        sx={{
          justifyContent: "center",
          display: "flex",
          flexWrap: "wrap",
          padding: "30px",
        }}
      >
        <TextField
          fullWidth
          label="PostgreSQL Database Hostname"
          value={postgresHostName}
          onChange={(event) => setPostgresHostName(event.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="PostgreSQL Database Name"
          value={postgresDBName}
          onChange={(event) => setPostgresDBName(event.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          type="number"
          label="PostgreSQL Port"
          value={postgresPort}
          onChange={(event) => setPostgresPort(event.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="PostgreSQL Username"
          value={postgresUsername}
          onChange={(event) => setPostgresUsername(event.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="PostgreSQL Password"
          type="password"
          value={postgresPassword}
          onChange={(event) => setPostgresPassword(event.target.value)}
          margin="normal"
          required
        />

        <Box sx={{ display: "block", textAlign: "center", marginTop: "10px" }}>
          <Button
            onClick={testDBConnection}
            variant="outlined"
            sx={{
              ml: 4,
              padding: "10px 30px 10px 30px",
              maxHeight: "60px",
              backgroundColor: "theme.primary.main",
            }}
          >
            Test Connection
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
