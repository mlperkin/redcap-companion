import React from "react";
import Grid from "@mui/material/Grid";
import { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import DatabaseDropdown from "./dbForms/DatabaseDropdown";
import MySQLForm from "./dbForms/MySQLForm";
import PostgresForm from "./dbForms/PostgresForm";
import { encryptData, decryptData } from "../utils/encryption";
import CsvExportIcon from "../icons/csvExport.png";
const { ipcRenderer } = window.require("electron");

export default function MyAccountAPIKeys(props) {
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [formData, setFormData] = useState({
    redcapAPIKey: "",
    redcapAPIURL: "",
  });
  const [redcapAPITest, setRedcapAPITest] = useState("");

  function handleFormSubmit(event) {
    event.preventDefault();
  }

  // Load the saved form data from localStorage on component mount
  useEffect(() => {
    const savedFormData = localStorage.getItem("redcapFormData");
    if (savedFormData) {
      const decryptedData = decryptData(savedFormData); // Decrypt the data
      if (decryptedData) {
        setFormData(decryptedData);
      }
    }
  }, []);

  // Save the form data to localStorage whenever it changes
  useEffect(() => {
    if (formData.redcapAPIKey && formData.redcapAPIURL) {
      const encryptedData = encryptData(formData); // Encrypt the data
      localStorage.setItem("redcapFormData", encryptedData);
    }
  }, [formData]);

  async function testRedcapAPI(event) {
    event.preventDefault();
    const { redcapAPIKey, redcapAPIURL } = formData;
    if (!redcapAPIKey || !redcapAPIURL) {
      setRedcapAPITest("Please provide both API key and URL.");
      return;
    }

    // Call the main process function via ipcRenderer
    const isAPIConnected = await ipcRenderer.invoke("testRedcapAPI", formData);
    setRedcapAPITest(
      isAPIConnected ? "Connected to REDCap API!" : "Failed to connect."
    );
  }

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };
  // Load the saved form data from localStorage on component mount
  useEffect(() => {
    // if (!formDataLoaded) {
    const selectedDB = localStorage.getItem("selectedDB");
    if (selectedDB) setSelectedDatabase(selectedDB);
    // }
  }, []);

  const handleDBChange = (event) => {
    console.log("db change", event.target.value);
    setSelectedDatabase(event.target.value);
    localStorage.setItem("selectedDB", event.target.value);
  };

  // Function to render the appropriate database form based on selectedDatabase value
  const renderDatabaseForm = () => {
    switch (selectedDatabase) {
      case "None - Export to CSV files":
        return (
          <Box sx={{ margin: "30px" }}>
            <img
              src={CsvExportIcon}
              width="100px"
              height="auto"
              alt="CSV Export Icon"
            />
          </Box>
        );
      case "MySQL":
        return <MySQLForm />;
      case "PostgreSQL":
        return <PostgresForm />;

      // Add other cases for other database forms
      default:
        return null;
    }
  };

  return (
    <>
      <Grid container spacing={1} sx={{ margin: "30px" }}>
        {/* REDCAP KEY */}

        <Grid
          item
          xs={12}
          lg={3}
          sx={{
            display: "flex",
            // alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            margin: "20px",
            // padding: "30px",
            // margin: '30px'
          }}
        >
          <Paper elevation={3}>
            <Box sx={{ textAlign: "center" }}>
              <h3>REDCap Credentials</h3>
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
        </Grid>

        {/* DB INFO */}
        <Grid
          item
          xs={12}
          lg={4}
          sx={{
            // display: "flex",
            // alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            // margin: "20px",
            padding: "30px",
            margin: "30px",
          }}
        >
          <Paper elevation={3} sx={{ padding: "10px" }}>
            {/* Determine which db form to use here with dropdown selected value */}
            <Box sx={{ textAlign: "center" }}>
              <h3>Database Credentials</h3>
            </Box>
            <DatabaseDropdown
              handleDBChange={handleDBChange}
              selectedDatabase={selectedDatabase}
            />
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          lg={3}
          sx={{
            justifyContent: "center",
            display: "flex",
            flexWrap: "wrap",
            margin: "20px",
          }}
        >
          <Paper elevation={3}>
            {/* Determine which db form to use here with dropdown selected value */}

            {renderDatabaseForm()}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
