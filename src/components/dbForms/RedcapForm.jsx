import React, { useState, useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { encryptData, decryptData } from "../../utils/encryption";
import { Check, Clear } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";

const { ipcRenderer } = window.require("electron");

export default function RedcapForm() {
  const [formData, setFormData] = useState({
    redcapAPIKey: "",
    redcapAPIURL: "",
  });
  const [redcapAPITest, setRedcapAPITest] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isRedcapConnected, setIsRedcapConnected] = useState(null); // Use null initially for an undetermined state

  // Function to load the data 
  useEffect(() => {
    // Request the store data from the main process when the component mounts
    ipcRenderer.invoke("getStoreData").then((data) => {
      const decryptedData = decryptData(data.redcapFormData); // Decrypt the data
      if (decryptedData) {
        setFormData(decryptedData)
      }
    });
  }, []);

  // Function to update the store data
  const updateStoreData = (newData) => {
    console.log("update storedata", newData);
    // Send a message to the main process to update the store data
    ipcRenderer.send("setStoreData", newData);
  };

  // // Save the form data to localStorage whenever it changes
  useEffect(() => {
    if (formData.redcapAPIKey && formData.redcapAPIURL) {
      const encryptedData = encryptData(formData); // Encrypt the data
      updateStoreData({ redcapFormData: encryptedData }); // Update the Electron store with the encrypted data
    }
  }, [formData]);

  function handleFormSubmit(event) {
    event.preventDefault();
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  async function testRedcapAPI(event) {
    event.preventDefault();
    setIsTesting(true);
    const { redcapAPIKey, redcapAPIURL } = formData;
    if (!redcapAPIKey || !redcapAPIURL) {
      setRedcapAPITest("Please provide both API key and URL.");
      return;
    }

    // Call the main process function via ipcRenderer
    const isRedcapConnected = await ipcRenderer.invoke(
      "testRedcapAPI",
      formData
    );
    setIsRedcapConnected(isRedcapConnected);
    setIsTesting(false);
  }

  return (
    <Paper elevation={3}>
      <Box sx={{ textAlign: "center" }}>
        <h3>REDCap Credentials</h3>
      </Box>
      <Box sx={{ display: "block", marginTop: "10px", textAlign: "center" }}>
        {isTesting ? (
          // If testing is in progress, show the CircularProgress
          <CircularProgress />
        ) : isRedcapConnected === null ? null : isRedcapConnected ? ( // If connection status is null, show nothing (undetermined)
          // If connection is successful, show the green check icon to the left of the text
          <Typography>
            <Check style={{ color: "green", marginRight: "5px" }} />
            Connected to REDCap
          </Typography>
        ) : (
          // If connection fails, show the red x icon to the left of the text
          <Typography>
            <Clear style={{ color: "red", marginRight: "5px" }} />
            Failed to connect to REDCap
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
          label="REDCap API Key"
          value={formData.redcapAPIKey}
          onChange={handleChange}
          margin="normal"
          required
          minLength="10"
          name="redcapAPIKey"
          type="password"
          id="redcapAPIKey"
        />

        <TextField
          fullWidth
          label="REDCap API URL"
          value={formData.redcapAPIURL}
          onChange={handleChange}
          margin="normal"
          required
          name="redcapAPIURL"
          type="text"
          id="redcapAPIURL"
        />

        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <Button
            onClick={testRedcapAPI}
            variant="outlined"
            sx={{
              ml: 4,
              padding: "10px 30px 10px 30px",
              maxHeight: "60px",
              marginTop: "auto", // Add this line
            }}
          >
            Test REDCap API
          </Button>
          <Grid item xs={12}>
            <Box sx={{ display: "block", marginTop: "10px" }}>
              <Typography>{redcapAPITest}</Typography>
            </Box>
          </Grid>
        </Box>
      </Box>
    </Paper>
  );
}
