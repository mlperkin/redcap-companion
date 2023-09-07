// OMOPCheckboxes.js
import React, { } from "react";
import { Checkbox, FormControlLabel } from "@mui/material";
import { useDataContext } from "./context/DataContext";

const OMOPCheckboxes = () => {
  const { selectedOMOPTables, setSelectedOMOPTables } = useDataContext();
  const OMOP_TABLES = ["person", "observation_period", "visit_occurrence", 'observation']; // List of your OMOP tables
//   const OMOP_TABLES = ["person", "observation_period", "visit_occurrence", 'condition_occurrence', 'drug_exposure', 'procedure_occurrence', 'observation', 'measurement']; // List of your OMOP tables

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedOMOPTables((prevTables) => [...prevTables, name]);
    } else {
      setSelectedOMOPTables((prevTables) =>
        prevTables.filter((table) => table !== name)
      );
    }
  };

  return (
    <div>
      {OMOP_TABLES.map((table) => (
        <FormControlLabel
          key={table}
          control={
            <Checkbox
              name={table}
              checked={selectedOMOPTables.includes(table)}
              onChange={handleCheckboxChange}
            />
          }
          label={table}
        />
      ))}
    </div>
  );
};

export default OMOPCheckboxes;
