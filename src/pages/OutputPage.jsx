import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography,
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
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import {
  processObservationPeriods,
  generateObservationPeriodSQL,
} from "../components/OMOPTableParsing/observation_period";
import { processPersonData } from "../components/OMOPTableParsing/person";
import { processVisitOccurrenceData } from "../components/OMOPTableParsing/visit_occurrence";
import {
  extractYearFromDate,
  sqlToCSV,
  downloadCSV,
  downloadSQL,
  downloadExcludedData,
} from "../utils/functions";

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
    // execStatus,
    setExecStatus,
    ddData,
    redcapFormName,
    selectedOMOPTables,
    mandatoryOMOPTables,
    // checkboxFieldData,
    // extraMappedData,
  } = useDataContext();

  // State for checkboxes
  const [checkedFormats, setCheckedFormats] = useState({
    SQL: false,
    CSV: true,
  });
  // const [checksPassed, setChecksPassed] = useState(0);
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
  let excludedItems = [];

  // Function to load the data
  useEffect(() => {
    // Request the store data from the main process when the component mounts
    ipcRenderer.invoke("getStoreData").then((data) => {
      const redcapDecryptedData = decryptData(data.redcapFormData); // Decrypt the data
      const mysqlDecryptedData = decryptData(data.MySQLForm); // Decrypt the data
      // console.log("dbcreds", dbCreds);
      const savedPGFormData = localStorage.getItem("postgresFormData");
      let postgresDecryptedData;
      if (savedPGFormData) {
        postgresDecryptedData = decryptData(savedPGFormData); // Decrypt the data
      }
      if (selectedDatabase === "MySQL") {
        // console.log("mysql selected");
        setDBCreds(mysqlDecryptedData);
        handleDBOutput("MySQL");
      } else if (selectedDatabase === "PostgreSQL") {
        setDBCreds(postgresDecryptedData);
        handleDBOutput("Postgres");
      }

      if (redcapDecryptedData) {
        setFormData(redcapDecryptedData);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDatabase]);

  function handleDBOutput() {
    console.log("dbCreds", dbCreds);
  }

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
    // console.info("redcapformname", redcapFormName);

    if (redcapFormName) passedChecks++;

    setIsValid(passedChecks === totalChecks); // Set to true if all checks pass
    // Set the number of checks that passed to display the fraction (e.g., "1/2")
    // setChecksPassed(passedChecks);
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
    event.preventDefault();
    setIsTesting(true);
    const { redcapAPIKey, redcapAPIURL } = formData;
    if (!redcapAPIKey || !redcapAPIURL) {
      // console.log("returning missing api key or url");
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
              Error!
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
                Test
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
                Test
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
            // break; // No need to continue checking other keys for this pair of objects
          }
        }
      });
    });

    console.log("mergedRedcapRecords", redCapRecords);
    let storedData = localStorage.getItem("extraMappedData");
    if (storedData) {
      storedData = JSON.parse(storedData);
      // console.log("storedData (extraMapping", storedData);

      const finalMergedDataArray = [];

      //finally merge redcapRecords with the extra mapping data we have
      redCapRecords.forEach((record) => {
        const mergedRecord = {};

        for (let key in storedData) {
          mergedRecord[key] = {};
          for (let attribute in storedData[key]) {
            const storedDataDetails = storedData[key][attribute];
            const field = storedDataDetails.textfieldValue;
            if (record[field]) {
              if (
                typeof record[field] === "string" &&
                storedDataDetails.format === "YYYY-MM-DD"
              ) {
                // mergedRecord[key][attribute] = record[field].split("-")[0];
                mergedRecord[key][attribute] = record[field];
              } else {
                mergedRecord[key][attribute] = record[field];
              }
            }

            if (storedDataDetails.concept_id) {
              const ogKey =
                storedDataDetails.ogKey || storedDataDetails.fieldName || "";
              const ogValue = storedDataDetails.ogValue || "";
              //if we have the odd exception like birthdate
              if (
                !storedDataDetails.ogKey &&
                storedDataDetails.fieldName &&
                storedDataDetails.format !== ""
              ) {
                // console.log("format", storedDataDetails.format);
                //get date format and then get only the year
                const dateValue = record[ogKey].redcap_value.toString();
                const format = storedDataDetails.format;
                let birthYear;

                try {
                  birthYear = extractYearFromDate(dateValue, format);
                } catch (error) {
                  console.error(error.message);
                }
                mergedRecord[key][attribute] = birthYear;
              } else if (
                record[ogKey] &&
                record[ogKey].redcap_value.toString() === ogValue
              ) {
                mergedRecord[key][attribute] = storedDataDetails.concept_id;
              }
            }
          }
        }

        finalMergedDataArray.push(mergedRecord);
      });

      console.log("finalMergedDataArray", finalMergedDataArray);
      return finalMergedDataArray;
    } else {
      console.log("No storedData found in localStorage");
      return redCapRecords;
    }
  }
  // 4. iterate through this merged list to create SQL CSV files (for upsert on mysql and postgresql)
  async function generateOutput(matchedAndMergedRedcapRecords) {
    if (!matchedAndMergedRedcapRecords.length) return;
    generateOutputFiles(matchedAndMergedRedcapRecords);
    setExecStatus(true);
    setIsExecuting(false);
  }

  async function generateOutputFiles(data) {
    let personSQLContent = "DO $$ \nDECLARE \nBEGIN\n\n";
    let observationSQLContent = "DO $$ \nDECLARE \nBEGIN\n\n";
    let observationPeriodSQLContent = "DO $$ \nDECLARE \nBEGIN\n\n";
    let visit_occurrenceSQLContent = "DO $$ \nDECLARE \nBEGIN\n\n";

    // Process person and observation period first
    for (const item of data) {
      personSQLContent += await processPersonData(item, excludedItems);
    }

    const observationPeriods = await processObservationPeriods(
      data,
      excludedItems
    );
    observationPeriodSQLContent +=
      generateObservationPeriodSQL(observationPeriods);

    // Now remaining tables can be ETL'd
    for (const item of data) {
      visit_occurrenceSQLContent += processVisitOccurrenceData(
        item,
        excludedItems,
        observationPeriods
      );
    }

    personSQLContent += "END $$;";
    observationSQLContent += "END $$;";
    observationPeriodSQLContent += "END $$;";
    visit_occurrenceSQLContent += "END $$;";
    console.log("personsql", personSQLContent);
    const tableConfig = {
      person: {
        SQL: personSQLContent,
        CSV: sqlToCSV(personSQLContent),
      },
      observation_period: {
        SQL: observationPeriodSQLContent,
        CSV: sqlToCSV(observationPeriodSQLContent),
      },
      visit_occurrence: {
        SQL: visit_occurrenceSQLContent,
        CSV: sqlToCSV(visit_occurrenceSQLContent),
      },
      observation: {
        SQL: observationSQLContent,
        CSV: sqlToCSV(observationSQLContent),
      },
    };

    // Assuming mandatoryOMOPTables is an array containing mandatory table names

    const uniqueTables = new Set([
      ...selectedOMOPTables,
      ...mandatoryOMOPTables,
    ]);

    uniqueTables.forEach((table) => {
      if (tableConfig.hasOwnProperty(table)) {
        downloadFilesForTable(table, tableConfig[table]);
      } else {
        console.warn(`No configuration found for table: ${table}`);
      }
    });

    downloadExcludedData(excludedItems);
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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              marginTop="16px"
            >
              <h1>Output to OMOP</h1>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            {" "}
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
          </Grid>
          {/* Right Column (Main content) */}
          <Grid item xs={12} md={8}>
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
              <Container>
                <Divider />
                <Paper>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <br />
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
                        </TableCell>
                        <TableCell> </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell></TableCell>
                        <TableCell>
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
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default OutputPage;
