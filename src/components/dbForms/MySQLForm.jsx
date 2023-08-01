import React, { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { encryptData, decryptData } from "../../utils/encryption";
import { Check, Clear } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import MysqlLogoIcon from "../../images/mysql_logo.png";

const { ipcRenderer } = window.require("electron");

export default function MySQLForm({ dataObj }) {
  const [mysqlHostName, setMysqlHostName] = useState("localhost");
  const [mysqlPort, setMysqlPort] = useState("3306");
  const [mysqlUsername, setMysqlUsername] = useState("");
  const [mysqlPassword, setMysqlPassword] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [formDataLoaded, setFormDataLoaded] = useState(false);
  const [isMySQLConnected, setIsMySQLConnected] = useState(null); // Use null initially for an undetermined state

  function handleFormSubmit(event) {
    event.preventDefault();
  }

  // Function to load the data
  useEffect(() => {
    // Request the store data from the main process when the component mounts
    ipcRenderer.invoke("getStoreData").then(async (data) => {
      const decryptedData = await decryptData(data.MySQLForm); // Decrypt the data
      if (decryptedData) {
        setMysqlHostName(decryptedData.hostname);
        setMysqlPort(decryptedData.port);
        setMysqlUsername(decryptedData.username);
        setMysqlPassword(decryptedData.password);
        setFormDataLoaded(true);
      } else {
        setFormDataLoaded(true);
      }
    });
  }, [formDataLoaded]);

  // Function to update the store data
  const updateStoreData = (newData) => {
    // Send a message to the main process to update the store data
    ipcRenderer.send("setStoreData", newData);
  };

  // Save the form data to localStorage whenever it changes
  useEffect(() => {
    const formData = {
      db: "MySQL",
      hostname: mysqlHostName,
      port: mysqlPort,
      username: mysqlUsername,
      password: mysqlPassword,
    };
    if (formDataLoaded) {
      const encryptedData = encryptData(formData); // Encrypt the data
      updateStoreData({ MySQLForm: encryptedData }); // Update the Electron store with the encrypted data
    }
  }, [mysqlHostName, mysqlPort, mysqlUsername, mysqlPassword, formDataLoaded]);

  async function testDBConnection(event) {
    event.preventDefault();
    const formData = {
      db: "MySQL",
      hostname: mysqlHostName,
      port: mysqlPort,
      username: mysqlUsername,
      password: mysqlPassword,
    };
    setIsTesting(true);
    let dbObj = formData;
    // Call the main process function via ipcRenderer
    const isMySQLConnected = await ipcRenderer.invoke(
      "testDBConnection",
      dbObj
    );
    // Update the state with the connection status
    setIsMySQLConnected(isMySQLConnected);
    setIsTesting(false);
  }

  return (
    <Paper elevation={3}>
      <Box sx={{ textAlign: "center", paddingTop: '30px' }}>
      <img width={"70px"} src={MysqlLogoIcon} alt="mysql logo" />
        {/* <h3>MySQL Database Credentials</h3> */}
        
      </Box>
      <Box sx={{ display: "block", marginTop: "10px", textAlign: "center" }}>
        {isTesting ? (
          // If testing is in progress, show the CircularProgress
          <CircularProgress />
        ) : isMySQLConnected === null ? null : isMySQLConnected ? ( // If connection status is null, show nothing (undetermined)
          // If connection is successful, show the green check icon
          <Typography>
            <Check style={{ color: "green", marginRight: "5px" }} />
            <br />
            Connected to MySQL!
          </Typography>
        ) : (
          // If connection fails, show the red x icon
          <Typography>
            <Clear style={{ color: "red", marginRight: "5px" }} />
            <br />
            Failed to connect to MySQL!
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
          label="MySQL Database Hostname"
          value={mysqlHostName}
          onChange={(event) => setMysqlHostName(event.target.value)}
          margin="normal"
          required
        />

        <TextField
          fullWidth
          type="number"
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
      </Box>
    </Paper>
  );
}
