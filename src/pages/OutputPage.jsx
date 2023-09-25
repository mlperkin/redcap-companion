import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Tooltip,
  Typography,
  FormControl,
} from "@mui/material";
import Paper from "@mui/material/Paper";
import { useDataContext } from "../components/context/DataContext";
import { useNavigate } from "react-router-dom";
import BootstrapTooltip from "../components/BootstrapTooltip";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";
import { decryptData } from "../utils/encryption";
import OMOPCheckboxes from "../components/OMOPCheckboxes";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';

// import { ConnectingAirportsOutlined } from "@mui/icons-material";

const { ipcRenderer } = window.require("electron");

const OutputPage = () => {
  const {
    selectedFilename,
    selectedDatabase,
    isRedcapConnected,
    setIsRedcapConnected,
    isExecuting,
    setIsExecuting,
    execStatus,
    setExecStatus,
    ddData,
    redcapFormName,
    selectedOMOPTables,
    checkboxFieldData,
  } = useDataContext();

  // State for checkboxes
  const [checkedFormats, setCheckedFormats] = useState({
    SQL: false,
    CSV: false,
  });
  const [checksPassed, setChecksPassed] = useState(0);
  const [isValid, setIsValid] = useState(true); //set true, if any checks fail then set to false
  // const [redcapAPITest, setRedcapAPITest] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [formData, setFormData] = useState({
    redcapAPIKey: "",
    redcapAPIURL: "",
  });

  const outputFormats = ["SQL", "CSV"];
  const [dbCreds, setDBCreds] = useState();
  // const [mergedData, setMergedData] = useState([]);

  const navigate = useNavigate();

  let totalChecks = 4; //how many total checks here

  // Function to load the data
  useEffect(() => {
    // setFormDataLoaded(false);
    console.log("get store data");
    // Request the store data from the main process when the component mounts
    ipcRenderer.invoke("getStoreData").then((data) => {
      const redcapDecryptedData = decryptData(data.redcapFormData); // Decrypt the data
      const mysqlDecryptedData = decryptData(data.MySQLForm); // Decrypt the data
      console.log("redcap", redcapDecryptedData);
      const savedPGFormData = localStorage.getItem("postgresFormData");
      let postgresDecryptedData;
      if (savedPGFormData) {
        postgresDecryptedData = decryptData(savedPGFormData); // Decrypt the data
      }
      if (selectedDatabase === "MySQL") {
        // console.log("mysql selected");
        setDBCreds(mysqlDecryptedData);
      } else if (selectedDatabase === "PostgreSQL") {
        setDBCreds(postgresDecryptedData);
      }
      // console.log("pg decrypt", postgresDecryptedData);
      // console.log("mysql decrypted", mysqlDecryptedData);
      if (redcapDecryptedData) {
        setFormData(redcapDecryptedData);
        // console.log("redcap decrypted data", redcapDecryptedData);
      }
      // setFormDataLoaded(true);
    });
  }, [selectedDatabase]);

  function handleClickPrev() {
    if (isExecuting) return;
    navigate("/mappedData");
  }

  useEffect(() => {
    let passedChecks = 0;

    if (selectedDatabase) {
      passedChecks++;
    }

    if (isRedcapConnected) {
      passedChecks++;
    }

    if (ddData && ddData.length) passedChecks++;
    console.info("redcapformname", redcapFormName);

    if (redcapFormName) passedChecks++;

    setIsValid(passedChecks === totalChecks); // Set to true if all checks pass
    // Set the number of checks that passed to display the fraction (e.g., "1/2")
    setChecksPassed(passedChecks);
  }, [
    isRedcapConnected,
    ddData,
    selectedDatabase,
    redcapFormName,
    totalChecks,
  ]);

  function executionText() {
    if (selectedDatabase === "None - Export to CSV files") {
      return <Typography>Executing...creating CSV files...</Typography>;
    } else if (selectedDatabase === "MySQL") {
      return <Typography>Executing...inserting into MySQL...</Typography>;
    } else if (selectedDatabase === "PostgreSQL") {
      return <Typography>Executing...inserting into PostgreSQL...</Typography>;
    }
  }

  async function testRedcapAPI(event) {
    console.log("test redcap api!");
    console.log("form", formData);
    event.preventDefault();
    setIsTesting(true);
    const { redcapAPIKey, redcapAPIURL } = formData;
    if (!redcapAPIKey || !redcapAPIURL) {
      console.log("returning missing api key or url");
      setIsRedcapConnected(false);
      setIsTesting(false);
      // setRedcapAPITest("Please provide both API key and URL.");
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

  const redcapConnected = () => {
    if (isRedcapConnected === true) {
      return (
        <>
          Connected
          <CheckCircleOutlineIcon
            style={{ color: "green", marginLeft: "5px" }}
          />
        </>
      );
    } else if (isRedcapConnected === false) {
      return (
        <>
          {isTesting ? ( // Check if isTesting is true
            <CircularProgress />
          ) : (
            <>
              Not Connected
              <CancelIcon style={{ color: "red", marginLeft: "5px" }} />
              <Button
                onClick={testRedcapAPI}
                variant="outlined"
                sx={{
                  ml: 4,
                  padding: "10px 30px 10px 30px",
                  maxHeight: "60px",
                  marginTop: "auto",
                }}
              >
                Test Connection
              </Button>
            </>
          )}
        </>
      );
    } else if (isRedcapConnected === null) {
      return (
        <>
          {isTesting ? ( // Check if isTesting is true
            <CircularProgress />
          ) : (
            <>
              Not Tested
              <CancelIcon style={{ color: "red", marginLeft: "5px" }} />
              <Button
                onClick={testRedcapAPI}
                variant="outlined"
                sx={{
                  ml: 4,
                  padding: "10px 30px 10px 30px",
                  maxHeight: "60px",
                  marginTop: "auto",
                }}
              >
                Test Connection
              </Button>
            </>
          )}
        </>
      );
    }
  };

  async function output() {
    setIsExecuting(true);
    setExecStatus(null);
    console.log("output format is", checkedFormats);
    //the steps involved here
    // 1. get all redcap records for selected form
    let redCapRecords = await getRedcapRecords();
    // 2. match redcap records field_names with field_names from data dictionary and merge these two together
    let mergedRedcapRecords = await matchAndMergeRedcapRecords(redCapRecords);
    // 3. iterate through this merged list to create SQL CSV files (for upsert on mysql and postgresql)
    // setMergedData(mergedRedcapRecords);
    await generateOutput(mergedRedcapRecords);
  }

  //the steps involved here
  // 1. get all redcap records for selected form
  async function getRedcapRecords() {
    // Call the main process function via ipcRenderer
    let modFormData = { ...formData, formName: redcapFormName };
    const redcapRecords = await ipcRenderer.invoke(
      "getRedcapRecords",
      modFormData
    );

    console.log("redcap records", redcapRecords);
    return redcapRecords;
  }
  // 2. match redcap records field_names with field_names from data dictionary
  async function matchAndMergeRedcapRecords(redCapRecords) {
    if (!redCapRecords) return;

    redCapRecords.forEach((obj1) => {
      ddData.forEach((obj2) => {
        for (const key in obj1) {
          if (key === obj2.field_name) {
            obj1[key] = {
              redcap_value: obj1[key],
              mapping_metadata: JSON.parse(obj2.field_annotation),
            };
            break; // No need to continue checking other keys for this pair of objects
          }
        }
      });
    });
    // console.log("obj1", redCapRecords);

    return redCapRecords;
  }
  // 4. iterate through this merged list to create SQL CSV files (for upsert on mysql and postgresql)
  async function generateOutput(matchedAndMergedRedcapRecords) {
    console.log("generate output", selectedDatabase);
    console.log("output to this", selectedDatabase);
    console.log("with these creds", dbCreds);
    console.log("checkbox field data", checkboxFieldData);
    let personID = checkboxFieldData.person.idTextValue;
    console.log("personid", personID);
    if (!matchedAndMergedRedcapRecords.length) return;

    //we now need to iterate through this merged data and generate SQL
    console.log("gen output with this data", matchedAndMergedRedcapRecords);

    const filteredData = matchedAndMergedRedcapRecords.map((item) => {
      let newObj = {};

      // Keep the 'personID' key-value pair
      if (item[personID]) {
        newObj[personID] = item[personID];
      }

      // Keep the 'enroll date' key-value pair
      if (
        item[
          checkboxFieldData.observation_period.earliestObservationDateTextValue
        ]
      ) {
        newObj[
          checkboxFieldData.observation_period.earliestObservationDateTextValue
        ] =
          item[
            checkboxFieldData.observation_period.earliestObservationDateTextValue
          ];
      }

      // Keep the 'follw up date' key-value pair
      if (
        item[
          checkboxFieldData.observation_period.latestObservationDateTextValue
        ]
      ) {
        newObj[
          checkboxFieldData.observation_period.latestObservationDateTextValue
        ] =
          item[
            checkboxFieldData.observation_period.latestObservationDateTextValue
          ];
      }

      console.log("item", item["redcap_repeat_instrument"]);

      // Check each key in the object to see if it has an object with 'redcap_value' as a key
      for (let key in item) {
        if (
          item[key] &&
          typeof item[key] === "object" &&
          item[key].hasOwnProperty("redcap_value")
        ) {
          newObj[key] = item[key];
        }
      }

      return newObj;
    });

    generateOutputFiles(filteredData);

    setExecStatus(true);
    setIsExecuting(false);
  }

  // Constants
  const RACE_VALUES = [
    { race: "WHITE", value: 8527 },
    { race: "BLACK", value: 8516 },
    { race: "ASIAN", value: 8515 },
  ];
  const ETHNICITY_CONCEPT_ID_PLACEHOLDER = 38003564;
  const GENDER_CONCEPT_ID = "8507";

  function getRandomRaceValue() {
    const randomRaceIndex = Math.floor(Math.random() * RACE_VALUES.length);
    return RACE_VALUES[randomRaceIndex]?.value || 0;
  }

  function processPersonData(item) {
    let content = "";
    const personID = item[checkboxFieldData.person.idTextValue];
    const birthDateValue =
      item[checkboxFieldData.person.birthdateTextValue]?.redcap_value;
    const [year, month, day] = birthDateValue?.split("-") || [];
    const birthYear = new Date(year, month - 1, day).getFullYear();
    if (birthYear && birthDateValue) {
      content += `-- Inserting data for personID = ${personID} into person table\n`;
      content += `INSERT INTO person (person_id, birth_datetime,  gender_concept_id, year_of_birth, month_of_birth, day_of_birth, race_concept_id, ethnicity_concept_id) VALUES `;
      content += `('${personID}', '${birthDateValue}', ${GENDER_CONCEPT_ID}, ${birthYear}, ${parseInt(
        month
      )}, ${parseInt(
        day
      )}, ${getRandomRaceValue()}, ${ETHNICITY_CONCEPT_ID_PLACEHOLDER});\n\n`;
    }
    return content;
  }

  function processObservationData(item) {
    let content = "";
    const personID = item[checkboxFieldData.person.idTextValue];
    const birthDateConceptId =
      item.checkboxFieldData?.person?.birthdateTextValue?.mapping_metadata
        ?.extraData?.concept_id;
    const ageValue = item.imp_age?.redcap_value;
    const ageConceptId =
      item.imp_age?.mapping_metadata?.imp_age?.extraData?.concept_id;
    const observationEntries = [
      {
        conceptId: birthDateConceptId,
        value: item[checkboxFieldData.person.birthdateTextValue]?.redcap_value,
      },
      { conceptId: ageConceptId, value: ageValue },
    ];
    observationEntries.forEach(({ conceptId, value }) => {
      content += `-- Inserting observation for personID = ${personID}\n`;
      content += `INSERT INTO observation (observation_id, person_id, observation_concept_id, value_as_string, observation_date, observation_type_concept_id) `;
      content += `VALUES ((SELECT COALESCE(MAX(observation_id), 0) + 1 FROM observation), '${personID}', ${conceptId}, '${value}', CURRENT_DATE, 123456);\n\n`;
    });
    return content;
  }

  function processObservationPeriods(data) {
    const observationPeriods = {};
    data.forEach((item) => {
      const personID = item[checkboxFieldData.person.idTextValue];
      if (!observationPeriods[personID]) {
        observationPeriods[personID] = {
          start: new Date(
            item[
              checkboxFieldData.observation_period.earliestObservationDateTextValue
            ]
          ),
          stop: new Date(
            item[
              checkboxFieldData.observation_period
                .latestObservationDateTextValue
            ] ||
              item[
                checkboxFieldData.observation_period
                  .earliestObservationDateTextValue
              ]
          ),
        };
      } else {
        if (
          new Date(
            item[
              checkboxFieldData.observation_period.earliestObservationDateTextValue
            ]
          ) < observationPeriods[personID].start
        ) {
          observationPeriods[personID].start = new Date(
            item[
              checkboxFieldData.observation_period.earliestObservationDateTextValue
            ]
          );
        }
        if (
          new Date(
            item[
              checkboxFieldData.observation_period.latestObservationDateTextValue
            ]
          ) > observationPeriods[personID].stop
        ) {
          observationPeriods[personID].stop = new Date(
            item[
              checkboxFieldData.observation_period.latestObservationDateTextValue
            ]
          );
        }
      }
    });
    return observationPeriods;
  }

  function generateObservationPeriodSQL(observationPeriods) {
    let content = "";
    for (let personID in observationPeriods) {
      content += `-- Inserting observation period for personID = ${personID}\n`;
      content += `INSERT INTO observation_period (observation_period_id, person_id, observation_period_start_date, observation_period_end_date, period_type_concept_id) `;
      content += `VALUES ((SELECT COALESCE(MAX(observation_period_id), 0) + 1 FROM observation_period), '${personID}', '${formatDateToSQL(
        observationPeriods[personID].start
      )}', '${formatDateToSQL(
        observationPeriods[personID].stop
      )}', 44814724);\n\n`;
    }
    return content;
  }

  function generateOutputFiles(data) {
    let personSQLContent = "DO $$ \nDECLARE \nBEGIN\n\n";
    let observationSQLContent = "DO $$ \nDECLARE \nBEGIN\n\n";
    let observationPeriodSQLContent = "DO $$ \nDECLARE \nBEGIN\n\n";

    data.forEach((item) => {
      personSQLContent += processPersonData(item);
      observationSQLContent += processObservationData(item);
    });

    const observationPeriods = processObservationPeriods(data);
    observationPeriodSQLContent +=
      generateObservationPeriodSQL(observationPeriods);

    personSQLContent += "END $$;";
    observationSQLContent += "END $$;";
    observationPeriodSQLContent += "END $$;";

    const tableConfig = {
      person: {
        SQL: personSQLContent,
        CSV: sqlToCSV(personSQLContent),
      },
      observation_period: {
        SQL: observationPeriodSQLContent,
        CSV: sqlToCSV(observationPeriodSQLContent),
      },
      observation: {
        SQL: observationSQLContent,
        CSV: sqlToCSV(observationSQLContent),
      },
    };

    selectedOMOPTables.forEach((table) => {
      if (tableConfig.hasOwnProperty(table)) {
        downloadFilesForTable(table, tableConfig[table]);
      } else {
        console.warn(`No configuration found for table: ${table}`);
      }
    });
  }

  // Generic download function
  function downloadFilesForTable(table, contentObj) {
    if (checkedFormats.SQL) {
      downloadSQL(contentObj.SQL, `${table}.sql`);
    }
    if (checkedFormats.CSV) {
      downloadCSV(contentObj.CSV, `${table}.csv`);
    }
  }

  function extractValue(data) {
    if (typeof data === "object" && data.hasOwnProperty("redcap_value")) {
      return data.redcap_value;
    }
    return data;
  }

  function downloadSQL(sqlContent, fileName) {
    // Create a Blob with the SQL content
    const blob = new Blob([sqlContent], {
      type: "text/plain;charset=utf-8;",
    });

    // Create a link and click it to trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function downloadCSV(content, filename) {
    console.log("download csv", content);
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
  }

  function sqlToCSV(sqlContent) {
    // Extract values after the "VALUES" keyword
    const valueMatches = sqlContent.match(/VALUES\s*\(([^)]+)\)/g);

    if (!valueMatches || valueMatches.length < 1) {
      console.error("Invalid SQL content");
      return;
    }

    // Extract the headers only once
    const headerMatch = sqlContent.match(
      /\((person_id, birth_datetime,.*ethnicity_concept_id)\)/
    );
    if (!headerMatch) {
      console.error("Could not find headers");
      return;
    }
    const headers = headerMatch[1].split(",").map((s) => s.trim());

    // Convert values to CSV format
    const values = valueMatches.map((valueSet) => {
      return valueSet
        .replace(/VALUES\s*\(/, "") // Remove the "VALUES(" prefix
        .replace(/\);?$/, "") // Remove closing parenthesis and optional semicolon
        .split(",")
        .map((s) => s.trim())
        .join(",");
    });

    // Join headers and values
    return headers.join(",") + "\n" + values.join("\n");
  }

  // Additional utility function to convert a Date object to YYYY-MM-DD string
  function formatDateToSQL(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function downloadExcludedData(data) {
    let _dataString = JSON.stringify(data, null, 2);
    // Create a Blob with the SQL content
    const blob = new Blob([_dataString], {
      type: "text/plain;charset=utf-8;",
    });

    // Create a link and click it to trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "excludedData.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Checkbox change handler
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setCheckedFormats((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };

  return (
    <>
      <Container maxWidth="xl">
        <Box
          component="main"
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            minHeight: "90vh",
            textAlign: "center",
          }}
        >
          <Box sx={{ marginTop: "20px" }}>
            <h1 sx={{ textAlign: "center" }}>Output to OMOP</h1>
          </Box>

          <Container>
            <Paper elevation={3} sx={{ padding: "16px" }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <strong>Mapped Data:</strong>
                    </TableCell>
                    <TableCell>
                      {ddData && ddData.length ? (
                        <>
                          {selectedFilename
                            ? selectedFilename
                            : "REDCap API Used"}
                          <CheckCircleOutlineIcon
                            style={{ color: "green", marginLeft: "5px" }}
                          />
                        </>
                      ) : (
                        <>
                          Select a REDCap data dictionary with mapped results
                          <CancelIcon
                            style={{ color: "red", marginLeft: "5px" }}
                          />
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>REDCap Form Name:</strong>
                    </TableCell>
                    <TableCell>
                      {redcapFormName ? (
                        <>
                          {redcapFormName}
                          <CheckCircleOutlineIcon
                            style={{ color: "green", marginLeft: "5px" }}
                          />
                        </>
                      ) : (
                        <>
                          Form name not detected
                          <CancelIcon
                            style={{ color: "red", marginLeft: "5px" }}
                          />
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>Output Source:</strong>
                    </TableCell>
                    <TableCell>
                      {selectedDatabase ? (
                        <>
                          {selectedDatabase}
                          <CheckCircleOutlineIcon
                            style={{ color: "green", marginLeft: "5px" }}
                          />
                        </>
                      ) : (
                        <>
                          Please select an output source
                          <CancelIcon
                            style={{ color: "red", marginLeft: "5px" }}
                          />
                        </>
                      )}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>
                      <strong>REDCap Connectivity:</strong>
                    </TableCell>
                    <TableCell>{redcapConnected()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Divider />
            </Paper>
            <Divider />
            <Paper>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <br />
                      <Tooltip title="Import Config" placement="top">
                      <Button
                        disabled={!isValid || isExecuting}
                        onClick={output}
                        color="success"
                        variant="contained"
                        sx={{ marginTop: "10px" }}
                      >
                        <UploadIcon />
                      </Button>
                      </Tooltip>
                     
                      <Tooltip title="Export Config" placement="top">
                      <Button
                        disabled={!isValid || isExecuting}
                        onClick={output}
                        color="success"
                        variant="contained"
                        sx={{ marginTop: "10px", marginLeft: '20px' }}
                      >
                        <DownloadIcon />
                      </Button>
                      </Tooltip>
                      
                      <OMOPCheckboxes />
                      <br />
                      <h3>Output Format</h3>
                      {outputFormats.map((format) => (
                        <FormControlLabel
                          key={format}
                          control={
                            <Checkbox
                              name={format}
                              checked={checkedFormats[format]}
                              onChange={handleCheckboxChange}
                            />
                          }
                          label={format}
                        />
                      ))}
                      <br />
                      <Button
                        disabled={!isValid || isExecuting}
                        onClick={output}
                        color="success"
                        variant="contained"
                        sx={{ marginTop: "10px" }}
                      >
                        Output to OMOP
                      </Button>
                      <Box sx={{ margin: "20px" }}>
                        {isExecuting ? (
                          <>
                            <CircularProgress />
                            {executionText()}{" "}
                          </>
                        ) : null}

                        {/* {showExecResults()} */}
                      </Box>
                    </TableCell>
                    <TableCell> </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Paper>
          </Container>
          <br />
          <Box>
            <BootstrapTooltip title="Go Prev">
              <ArrowCircleLeftIcon
                onClick={handleClickPrev}
                sx={{ cursor: "pointer" }}
                color="primary"
                fontSize="large"
              />
            </BootstrapTooltip>
            <ArrowCircleLeftIcon
              sx={{ opacity: 0 }}
              color="primary"
              fontSize="large"
            />
          </Box>
        </Box>
        {/* {JSON.stringify(mergedData)} */}
      </Container>
    </>
  );
};

export default OutputPage;
