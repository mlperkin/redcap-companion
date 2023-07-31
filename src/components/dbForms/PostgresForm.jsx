import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { encryptData, decryptData } from "../../utils/encryption";
const { ipcRenderer } = window.require("electron");

export default function PostgresForm({dataObj}) {
  const [postgresHostName, setPostgresHostName] = useState("localhost");
  const [postgresPort, setPostgresPort] = useState("5432");
  const [postgresUsername, setPostgresUsername] = useState("");
  const [postgresPassword, setPostgresPassword] = useState("");
  const [postgresDBTest, setPostgresDBTest] = useState(false);
  const [formDataLoaded, setFormDataLoaded] = useState(false);

  function handleFormSubmit(event) {
    event.preventDefault();
  }

  // Load the saved form data from localStorage on component mount
  useEffect(() => {
    if (!formDataLoaded) {
      const savedFormData = localStorage.getItem("postgresFormData");
      if (savedFormData) {
        const decryptedData = decryptData(savedFormData); // Decrypt the data
        console.log('decrypted data', decryptedData)
        if (decryptedData) {
          setPostgresHostName(decryptedData.hostname);
          setPostgresPort(decryptedData.port);
          setPostgresUsername(decryptedData.username);
          setPostgresPassword(decryptedData.password);
        }
        setFormDataLoaded(true);
      }else{
        setFormDataLoaded(true);
      }
    }
  }, [formDataLoaded]);

  // Save the form data to localStorage whenever it changes
  useEffect(() => {
    const formData = {
      db: 'PostgreSQL',
      hostname: postgresHostName,
      port: postgresPort,
      username: postgresUsername,
      password: postgresPassword,
    };
    if (formDataLoaded) {
      const encryptedData = encryptData(formData); // Encrypt the data
      localStorage.setItem("postgresFormData", encryptedData);
    }
  }, [postgresHostName, postgresPort, postgresUsername, postgresPassword]);

  async function testDBConnection(event) {
    event.preventDefault();
    // console.log("handle form submit");
    let dbObj = {
      db: "PostgreSQL",
      hostname: postgresHostName,
      port: postgresPort,
      username: postgresUsername,
      password: postgresPassword,
    };

     // Call the main process function via ipcRenderer
     const isMySQLConnected = await ipcRenderer.invoke("testDBConnection", dbObj);
     if(!isMySQLConnected){
      setPostgresDBTest('Failed')
     }else{
      setPostgresDBTest('Connected to PostgreSQL DB!')
     }
  }

  return (
    <Paper elevation={3}>
      <Box sx={{ textAlign: "center" }}>
        <h3>PostgreSQL Database Credentials</h3>
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
          type='number'
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
            Test DB Connection
          </Button>
        </Box>
        <Typography>{postgresDBTest}</Typography>
      </Box>

      {/* <Box sx={{ display: "block", marginTop: "10px", textAlign: "center" }}>
        
      </Box> */}
    </Paper>
  );
}
