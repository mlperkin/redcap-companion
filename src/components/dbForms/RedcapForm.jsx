import React, { useState, useEffect } from "react";
import { Grid, Typography } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import { encryptData, decryptData } from "../../utils/encryption";
import { Check, Clear } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import BootstrapTooltip from "../BootstrapTooltip";
const { ipcRenderer } = window.require("electron");

export default function RedcapForm() {
  const [formData, setFormData] = useState({
    redcapAPIKey: "",
    redcapAPIURL: "",
  });
  const [redcapAPITest, setRedcapAPITest] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isRedcapConnected, setIsRedcapConnected] = useState(null); // Use null initially for an undetermined state
  const [formDataLoaded, setFormDataLoaded] = useState(false);
  // Function to load the data
  useEffect(() => {
    setFormDataLoaded(false);
    // Request the store data from the main process when the component mounts
    ipcRenderer.invoke("getStoreData").then((data) => {
      const decryptedData = decryptData(data.redcapFormData); // Decrypt the data
      if (decryptedData) {
        setFormData(decryptedData);
      }
      setFormDataLoaded(true);
    });
  }, []);

  // Function to update the store data
  const updateStoreData = (newData) => {
    // Send a message to the main process to update the store data
    ipcRenderer.send("setStoreData", newData);
  };

  // // Save the form data to localStorage whenever it changes
  useEffect(() => {
    if (formDataLoaded) {
      const encryptedData = encryptData(formData); // Encrypt the data
      updateStoreData({ redcapFormData: encryptedData }); // Update the Electron store with the encrypted data
    }
  }, [formData, formDataLoaded]);

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
        <BootstrapTooltip
          placement="top"
          title="This needs to be entered in order to get the records from your REDCap instance."
        >
          <HelpOutlineIcon />
        </BootstrapTooltip>
      </Box>
      <Box sx={{ display: "block", marginTop: "10px", textAlign: "center" }}>
        {isTesting ? (
          // If testing is in progress, show the CircularProgress
          <CircularProgress />
        ) : isRedcapConnected === null ? null : isRedcapConnected ? ( // If connection status is null, show nothing (undetermined)
          // If connection is successful, show the green check icon
          <Typography>
            <Check style={{ color: "green", marginRight: "5px" }} />
            <br />
            Connected to REDCap!
          </Typography>
        ) : (
          // If connection fails, show the red x icon
          <Typography>
            <Clear style={{ color: "red", marginRight: "5px" }} />
            <br />
            Failed to connect to REDCap!
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
