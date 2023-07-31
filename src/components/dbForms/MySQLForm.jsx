import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { encryptData, decryptData } from "../../utils/encryption";
const { ipcRenderer } = window.require("electron");

export default function MySQLForm({dataObj}) {
  const [mysqlHostName, setMysqlHostName] = useState("localhost");
  const [mysqlPort, setMysqlPort] = useState("3306");
  const [mysqlUsername, setMysqlUsername] = useState("");
  const [mysqlPassword, setMysqlPassword] = useState("");
  const [mysqlDBTest, setMysqlDBTest] = useState(false);
  const [formDataLoaded, setFormDataLoaded] = useState(false);

  function handleFormSubmit(event) {
    event.preventDefault();
  }

  // Load the saved form data from localStorage on component mount
  useEffect(() => {
    if (!formDataLoaded) {
      const savedFormData = localStorage.getItem("mysqlFormData");
      if (savedFormData) {
        const decryptedData = decryptData(savedFormData); // Decrypt the data
        console.log('decrypted data', decryptedData)
        if (decryptedData) {
          setMysqlHostName(decryptedData.hostname);
          setMysqlPort(decryptedData.port);
          setMysqlUsername(decryptedData.username);
          setMysqlPassword(decryptedData.password);
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
      db: 'MySQL',
      hostname: mysqlHostName,
      port: mysqlPort,
      username: mysqlUsername,
      password: mysqlPassword,
    };
    if (formDataLoaded) {
      const encryptedData = encryptData(formData); // Encrypt the data
      localStorage.setItem("mysqlFormData", encryptedData);
    }
  }, [mysqlHostName, mysqlPort, mysqlUsername, mysqlPassword]);

  async function testDBConnection(event) {
    event.preventDefault();
    // console.log("handle form submit");
    let dbObj = {
      db: "MySQL",
      hostname: mysqlHostName,
      port: mysqlPort,
      username: mysqlUsername,
      password: mysqlPassword,
    };

     // Call the main process function via ipcRenderer
     const isMySQLConnected = await ipcRenderer.invoke("testDBConnection", dbObj);
     if(!isMySQLConnected){
      setMysqlDBTest('Failed')
     }else{
      setMysqlDBTest('Connected to MySQL DB!')
     }
  }

  return (
    <Paper elevation={3}>
      <Box sx={{ textAlign: "center" }}>
        <h3>MySQL Database Credentials</h3>
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
          label="MySQL Database Hostname"
          value={mysqlHostName}
          onChange={(event) => setMysqlHostName(event.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          type='number'
          label="MySQL Port"
          value={mysqlPort}
          onChange={(event) => setMysqlPort(event.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="MySQL Username"
          value={mysqlUsername}
          onChange={(event) => setMysqlUsername(event.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          label="MySQL Password"
          type="password"
          value={mysqlPassword}
          onChange={(event) => setMysqlPassword(event.target.value)}
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
        <Typography>{mysqlDBTest}</Typography>
      </Box>

      {/* <Box sx={{ display: "block", marginTop: "10px", textAlign: "center" }}>
        
      </Box> */}
    </Paper>
  );
}
