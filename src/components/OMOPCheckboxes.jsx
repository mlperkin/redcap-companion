import React, { useEffect } from "react";
import {
  Checkbox,
  FormControlLabel,
  Tooltip,
  Chip,
  // Select,
  // MenuItem,
  // TextField,
  // InputLabel,
  // FormControl,
  Grid,
  Paper,
} from "@mui/material";
import { useDataContext } from "./context/DataContext";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

const OMOPCheckboxes = () => {
  const {
    selectedOMOPTables,
    setSelectedOMOPTables,
    // mandatoryOMOPTables,
    setMandatoryOMOPTables,
    // checkboxFieldData,
    setCheckboxFieldData,
  } = useDataContext();

  // Unified handler for all changes
  // const handleFormChange = (tableName, fieldName, event) => {
  //   const newValue = event.target.value;
  //   console.log("set checkbox field data", newValue);
  //   setCheckboxFieldData((prevData) => {
  //     const updatedData = {
  //       ...prevData,
  //       [tableName]: {
  //         ...prevData[tableName],
  //         [fieldName]: newValue,
  //       },
  //     };
  //     localStorage.setItem("checkboxFieldData", JSON.stringify(updatedData)); // Storing into localStorage
  //     return updatedData;
  //   });
  // };

  useEffect(() => {
    const storedData = localStorage.getItem("checkboxFieldData");
    // console.log("got stored data", JSON.parse(storedData));
    setMandatoryOMOPTables(MANDATORY_TABLES)
    if (storedData) {
      setCheckboxFieldData(JSON.parse(storedData));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const OMOP_CLINICAL_DATA_TABLES = [
    "person",
    "observation_period",
    "visit_occurrence",
    "visit_detail",
    "condition_occurrence",
    "drug_exposure",
    "procedure_occurrence",
    "observation",
    "measurement",
  ];

  const OMOP_HEALTH_SYSTEM_DATA_TABLES = ["location", "care_site", "provider"];

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
    // person: { label: "Mandatory", variant: "outlined", color: "info" },
    // observation_period: {
    //   label: "Mandatory",
    //   variant: "outlined",
    //   color: "info",
    // },
    // Add other tables and chip details as needed
  };

  const CustomizedFieldsForTable = {
    // person: (
    //   <div>
    //     <FormControl fullWidth margin="normal">
    //       <TextField
    //         label="ID"
    //         placeholder="Enter your field label for unique patient ID"
    //         value={
    //           checkboxFieldData.person
    //             ? checkboxFieldData.person.idTextValue
    //             : ""
    //         }
    //         onChange={(e) => handleFormChange("person", "idTextValue", e)}
    //         required
    //       />
    //       <br />
    //       <span>
    //         <TextField
    //           label="Birthdate"
    //           placeholder="Enter your field label for patient birthdate"
    //           value={
    //             checkboxFieldData.person
    //               ? checkboxFieldData.person.birthdateTextValue
    //               : ""
    //           }
    //           onChange={(e) =>
    //             handleFormChange("person", "birthdateTextValue", e)
    //           }
    //         />
    //         <Select
    //           labelId="demo-simple-select-label"
    //           id="demo-simple-select"
    //           defaultValue="YYYY-MM-DD"
    //           onChange={(e) =>
    //             handleFormChange("person", "birthdateSelectValue", e)
    //           }
    //         >
    //           <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
    //           <MenuItem value="YYYY/MM/DD">YYYY/MM/DD</MenuItem>
    //           <MenuItem value="DD-MM-YYYY">DD-MM-YYYY</MenuItem>
    //           <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
    //           <MenuItem value="MM-DD-YYYY">MM-DD-YYYY</MenuItem>
    //           <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
    //           <MenuItem value="YYYY.MM.DD">YYYY.MM.DD</MenuItem>
    //           <MenuItem value="DD.MM.YYYY">DD.MM.YYYY</MenuItem>
    //           <MenuItem value="MM.DD.YYYY">MM.DD.YYYY</MenuItem>
    //           <MenuItem value="DD MMM YYYY">
    //             DD MMM YYYY (e.g., 12 Sep 2023)
    //           </MenuItem>
    //         </Select>
    //         <br />
    //         <br />
    //         <TextField
    //           label="Race"
    //           placeholder="Enter your field label for race"
    //           value={
    //             checkboxFieldData.person.raceTextValue
    //               ? checkboxFieldData.person.raceTextValue
    //               : ""
    //           }
    //           onChange={(e) => handleFormChange("person", "raceTextValue", e)}
    //         />
    //         <br />
    //         <br />
    //         <TextField
    //           label="Male"
    //           placeholder="Enter your field label for male"
    //           value={
    //             checkboxFieldData.person.maleGenderTextValue
    //               ? checkboxFieldData.person.maleGenderTextValue
    //               : ""
    //           }
    //           onChange={(e) =>
    //             handleFormChange("person", "maleGenderTextValue", e)
    //           }
    //         />
    //         <br />
    //         <br />
    //         <span>
    //           <TextField
    //             label="Female"
    //             placeholder="Enter your field label for female"
    //             value={
    //               checkboxFieldData.person.femaleGenderTextValue
    //                 ? checkboxFieldData.person.femaleGenderTextValue
    //                 : ""
    //             }
    //             onChange={(e) =>
    //               handleFormChange("person", "femaleGenderTextValue", e)
    //             }
    //           />
    //           <TextField
    //             label="Female Answer Value"
    //             placeholder="The female answer value"
    //             value={
    //               checkboxFieldData.person.femaleGenderAnswerValue
    //                 ? checkboxFieldData.person.femaleGenderAnswerValue
    //                 : ""
    //             }
    //             onChange={(e) =>
    //               handleFormChange("person", "femaleGenderTextValue", e)
    //             }
    //           />
    //         </span>
    //       </span>
    //     </FormControl>
    //   </div>
    // ),
    // observation_period: (
    //   <div>
    //     <FormControl fullWidth margin="normal">
    //       <TextField
    //         label="Earliest Observation Date"
    //         placeholder="Enter your field label for earliest observation date"
    //         value={
    //           checkboxFieldData.observation_period
    //             ? checkboxFieldData.observation_period
    //                 .earliestObservationDateTextValue
    //             : ""
    //         }
    //         onChange={(e) =>
    //           handleFormChange(
    //             "observation_period",
    //             "earliestObservationDateTextValue",
    //             e
    //           )
    //         }
    //         required
    //       />
    //       <br />
    //       <span>
    //         <TextField
    //           label="Latest Observation Date"
    //           placeholder="Enter your field label for latest observation date"
    //           value={
    //             checkboxFieldData.observation_period
    //               ? checkboxFieldData.observation_period
    //                   .latestObservationDateTextValue
    //               : ""
    //           }
    //           onChange={(e) =>
    //             handleFormChange(
    //               "observation_period",
    //               "latestObservationDateTextValue",
    //               e
    //             )
    //           }
    //         />

    //         <br />
    //       </span>
    //     </FormControl>
    //   </div>
    // ),
    // Add similar JSX for other tables as needed
  };

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;

    // If the table is Mandatory, do not allow it to be unchecked
    if (MANDATORY_TABLES.includes(name) && !checked) return;

    if (checked) {
      setSelectedOMOPTables((prevTables) => [...prevTables, name]);
    } else {
      setSelectedOMOPTables((prevTables) =>
        prevTables.filter((table) => table !== name)
      );
    }
  };

  return (
    <>
      <Grid container>
        <Paper elevation={1}>
          <Grid item xs={12}>
            <h2>
              Clinical Data Tables{" "}
              <Tooltip
                title="Select OMOP Tables you want to generate output for
                        "
              >
                <HelpOutlineIcon />
              </Tooltip>
            </h2>
            {OMOP_CLINICAL_DATA_TABLES.map((table) => (
              <React.Fragment key={table}>
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
                        checked={selectedOMOPTables.includes(table) || MANDATORY_TABLES.includes(table)}
                        onChange={handleCheckboxChange}
                        disabled={MANDATORY_TABLES.includes(table)}
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
                  xs={6}
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
              </React.Fragment>
            ))}
          </Grid>
        </Paper>
        <Paper elevation={1}>
          <Grid item xs={12}>
            <h2>
              Health System Data Tables{" "}
              <Tooltip
                title="Select OMOP Tables you want to generate output for
                        "
              >
                <HelpOutlineIcon />
              </Tooltip>
            </h2>
            {OMOP_HEALTH_SYSTEM_DATA_TABLES.map((table) => (
              <React.Fragment key={table}>
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
                        disabled={MANDATORY_TABLES.includes(table)}
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
                  xs={6}
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
              </React.Fragment>
            ))}
          </Grid>
        </Paper>
      </Grid>
    </>
  );
};

export default OMOPCheckboxes;
