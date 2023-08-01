import React from "react";
import Grid from "@mui/material/Grid";
import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { Typography } from "@mui/material";
import DatabaseDropdown from "./dbForms/DatabaseDropdown";
import MySQLForm from "./dbForms/MySQLForm";
import RedcapForm from "./dbForms/RedcapForm";
import PostgresForm from "./dbForms/PostgresForm";
import CsvExportIcon from "../icons/csvExport.png";

export default function ConnectionsSetup(props) {
  const [selectedDatabase, setSelectedDatabase] = useState("");

  // Load the saved form data from localStorage on component mount
  useEffect(() => {
    const selectedDB = localStorage.getItem("selectedDB");
    if (selectedDB) setSelectedDatabase(selectedDB);
  }, []);

  const handleDBChange = (event) => {
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
            <Typography>
              This will output the OMOP data in CSV format in order to import into your own database and tables.
            </Typography>
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
        {/* REDCAP Form */}
        <Grid
          item
          xs={12}
          lg={3}
          sx={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            margin: "20px",
          }}
        >
          <RedcapForm />
        </Grid>

        {/* DB Select */}
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
            // padding: "10px",
            margin: "20px",
          }}
        >
         
            <DatabaseDropdown
              handleDBChange={handleDBChange}
              selectedDatabase={selectedDatabase}
            />
         
        </Grid>

        {/* DB Creds */}
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
            {renderDatabaseForm()}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
