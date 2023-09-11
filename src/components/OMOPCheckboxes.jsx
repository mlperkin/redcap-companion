import React from "react";
import { Checkbox, FormControlLabel, Tooltip, Chip } from "@mui/material";
import { useDataContext } from "./context/DataContext";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const OMOPCheckboxes = () => {
  const { selectedOMOPTables, setSelectedOMOPTables } = useDataContext();
  const OMOP_TABLES = [
    "person",
    "observation_period",
    "visit_occurrence",
    "observation",
  ];

  const MANDATORY_TABLES = ["person", "observation_period"];

  const TABLE_TOOLTIPS = {
    person:
      "Person: Contains records that uniquely identify each patient in the source data who is at-risk to have clinical observations recorded within the source systems.",
    observation_period:
      "Observation_period: Contains records which uniquely define the spans of time for which a Person is at-risk to have clinical events recorded within the source systems.",
    visit_occurrence:
      "The VISIT_OCCURRENCE table must be created before the standardized clinical data tables (condition_occurrence, observation, drug_exposure, procedure_occurrence, measurement, etc...) as they all refer to the VISIT_OCCURRENCE_ID. ",
    observation:
      "The OBSERVATION table captures clinical facts about a Person obtained in the context of examination, questioning or a procedure. Any data that cannot be represented by any other domains, such as social and lifestyle facts, medical history, family history, etc. are recorded here.",
    // Add other tables and their tooltips as needed
  };

  const TABLE_CHIP_DETAILS = {
    person: { label: "Mandatory", variant: "outlined", color: "info" },
    observation_period: {
      label: "Mandatory",
      variant: "outlined",
      color: "info",
    },
    // Add other tables and chip details as needed
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    // If the table is Mandatory, do not allow it to be unchecked
    // if (MANDATORY_TABLES.includes(name) && !checked) return;

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
        <>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              marginRight: "10px",
            }}
          >
            <FormControlLabel
              key={table}
              control={
                <Checkbox
                  name={table}
                  checked={selectedOMOPTables.includes(table)}
                  onChange={handleCheckboxChange}
                  // disabled={MANDATORY_TABLES.includes(table)}
                />
              }
              label={table}
            />
            <Tooltip
              key={`${table}-tooltip`}
              title={TABLE_TOOLTIPS[table] || ""}
              placement="top"
              arrow
            >
              <HelpOutlineIcon />
            </Tooltip>

            {TABLE_CHIP_DETAILS[table] && (
              <Chip
                label={TABLE_CHIP_DETAILS[table].label}
                variant={TABLE_CHIP_DETAILS[table].variant}
                color={TABLE_CHIP_DETAILS[table].color}
                size="small"
                style={{ marginLeft: "5px" }}
              />
            )}
          </div>
          <br />
        </>
      ))}
    </div>
  );
};

export default OMOPCheckboxes;
