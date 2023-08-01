import React, {  } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import BootstrapTooltip from "../BootstrapTooltip";

const DatabaseDropdown = ({ selectedDatabase, handleDBChange }) => {
  const databaseOptions = [
    "None - Export to CSV files",
    "MySQL",
    "PostgreSQL",
    // "SQLite",
    // "MongoDB",
    // "Microsoft SQL Server",
    // "Oracle",
  ];

  return (
    <Paper elevation={3} sx={{ padding: "10px" }}>
      {/* Determine which db form to use here with dropdown selected value */}
      <Box sx={{ textAlign: "center" }}>
        <h3>Output Source</h3>
      </Box>
      <BootstrapTooltip
        arrow
        placement="top"
        title="Select where you would like the OMOP table and records to be outputted to"
      >
        <HelpOutlineIcon />
      </BootstrapTooltip>
      <FormControl
        fullWidth
        sx={{
          justifyContent: "center",
          display: "flex",
          flexWrap: "wrap",
          // padding: "30px",
        }}
      >
        <InputLabel id="database-label">Select Database</InputLabel>

        <Select
          labelId="database-label"
          value={selectedDatabase}
          onChange={handleDBChange}
          label="Select Database"
        >
          {databaseOptions.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Paper>
  );
};

export default DatabaseDropdown;
