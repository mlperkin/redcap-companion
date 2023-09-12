import React from "react";
import {
  Checkbox,
  FormControlLabel,
  Tooltip,
  Chip,
  Select,
  MenuItem,
  TextField,
  // InputLabel,
  FormControl,
  Grid,
} from "@mui/material";
import { useDataContext } from "./context/DataContext";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const OMOPCheckboxes = () => {
  const {
    selectedOMOPTables,
    setSelectedOMOPTables,
    checkboxFieldData,
    setCheckboxFieldData,
  } = useDataContext();

  // Unified handler for all changes
  const handleFormChange = (tableName, fieldName, event) => {
    const newValue = event.target.value;
    setCheckboxFieldData((prevData) => ({
      ...prevData,
      [tableName]: {
        ...prevData[tableName],
        [fieldName]: newValue,
      },
    }));
  };

  const OMOP_TABLES = [
    "person",
    "observation_period",
    "visit_occurrence",
    "observation",
  ];

  // const MANDATORY_TABLES = ["person", "observation_period"];

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

  const CustomizedFieldsForTable = {
    person: (
      <div>
        {/* <FormControl fullWidth margin="normal">
          <InputLabel id="demo-simple-select-label">Select Option</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            defaultValue="option1"
          >
            <MenuItem value="option1">Option 1</MenuItem>
            <MenuItem value="option2">Option 2</MenuItem>
          </Select>
        </FormControl> */}
        {/* <FormControl fullWidth margin="normal">
          <InputLabel id="demo-simple-select-label">Select Option</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            defaultValue={checkboxFieldData.person.selectValue}
            onChange={handleSelectChange}
          >
            <MenuItem value="option1">Option 1</MenuItem>
            <MenuItem value="option2">Option 2</MenuItem>
          </Select>
        </FormControl> */}

        <FormControl fullWidth margin="normal">
          <TextField
            label="ID"
            placeholder="Enter field label for person"
            value={
              checkboxFieldData.person
                ? checkboxFieldData.person.idTextValue
                : ""
            }
            onChange={(e) => handleFormChange("person", "idTextValue", e)}
          />
          <br />
          <span>
            <TextField
              label="Birthdate"
              placeholder="Enter field label for birthdate"
              value={
                checkboxFieldData.person
                  ? checkboxFieldData.person.birthdateTextValue
                  : ""
              }
              onChange={(e) => handleFormChange("person", "birthdateTextValue", e)}
            />
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              defaultValue={checkboxFieldData.person.selectValue}
              onChange={(e) => handleFormChange("person", "birthdateSelectValue", e)}
            >
              <MenuItem value="option1">YYYY-MM-DD</MenuItem>
              <MenuItem value="option2">YYYY/MM/DD</MenuItem>
            </Select>
            <br/><br/>
            <TextField
              label="Gender"
              placeholder="Enter field label for gender"
              value={
                checkboxFieldData.person
                  ? checkboxFieldData.person.genderTextValue
                  : ""
              }
              onChange={(e) => handleFormChange("person", "genderTextValue", e)}
            />
          </span>
        </FormControl>
      </div>
    ),
    // Add similar JSX for other tables as needed
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
          <Grid
            item
            xs={12}
            lg={6}
            sx={{
              // justifyContent: "center",
              display: "flex",
              flexWrap: "wrap",
              // margin: "20px",
            }}
          >
            {/* Render additional UI components for the table if it's selected */}
            {selectedOMOPTables.includes(table) &&
              CustomizedFieldsForTable[table]}
          </Grid>

          <br />
        </>
      ))}
    </div>
  );
};

export default OMOPCheckboxes;
