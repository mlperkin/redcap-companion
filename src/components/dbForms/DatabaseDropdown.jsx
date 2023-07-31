import React, { useState } from "react";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const DatabaseDropdown = ({selectedDatabase, handleDBChange}) => {
//   const [selectedDatabase, setSelectedDatabase] = useState("");

 

  const handleFormSubmit = (event) => {};

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
    <FormControl
      fullWidth
      sx={{
        justifyContent: "center",
        display: "flex",
        flexWrap: "wrap",
        padding: "30px",
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
  );
};

export default DatabaseDropdown;
