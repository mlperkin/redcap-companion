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
  // FormControl,
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
// import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

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
    checkboxFieldData,
    extraMappedData,
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

  // Function to load the data
  useEffect(() => {
    // setFormDataLoaded(false);
    // console.log("get store data");
    // Request the store data from the main process when the component mounts
    ipcRenderer.invoke("getStoreData").then((data) => {
      const redcapDecryptedData = decryptData(data.redcapFormData); // Decrypt the data
      const mysqlDecryptedData = decryptData(data.MySQLForm); // Decrypt the data
      // console.log("redcap", redcapDecryptedData);
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
    // console.log("test redcap api!");
    // console.log("form", formData);
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
    // console.log("output format is", checkedFormats);
    // console.log("extramapped", extraMappedData);
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

    console.log("mergedRedcapRecords", redCapRecords);
    let storedData = localStorage.getItem("extraMappedData");
    if (storedData) {
      storedData = JSON.parse(storedData);
      console.log("storedData (extraMapping", storedData);

      const finalMergedDataArray = [];

      //finally merge redcapRecords with the extra mapping data we have
      redCapRecords.forEach((record) => {
        const mergedRecord = {};

        for (let key in storedData) {
          mergedRecord[key] = {};
          for (let attribute in storedData[key]) {
            const storedDataDetails = storedData[key][attribute];
            // console.log('storedDataDetails', storedDataDetails)
            // if (storedDataDetails.textfieldValue !== "") {
            const field = storedDataDetails.textfieldValue;
            // console.log('storedDataDetails', storedDataDetails)
            // console.log('field', field)
            // console.log('record', record)
            if (record[field]) {
              if (
                typeof record[field] === "string" &&
                storedDataDetails.format === "YYYY-MM-DD"
              ) {
                mergedRecord[key][attribute] = record[field].split("-")[0];
              } else {
                mergedRecord[key][attribute] = record[field];
              }
            }
            // }

            if (storedDataDetails.concept_id) {
              const ogKey =
                storedDataDetails.ogKey || storedDataDetails.fieldName || "";
              const ogValue = storedDataDetails.ogValue || "";
              console.log("ogKey", ogKey + "-" + ogValue);
              console.log("record", record);
              console.log("value", record[ogKey].redcap_value.toString());
              //if we have the odd exception like birthdate
              if (
                !storedDataDetails.ogKey &&
                storedDataDetails.fieldName &&
                storedDataDetails.format !== ""
              ) {
                console.log("format", storedDataDetails.format);
                //get date format and then get only the year
                const dateValue = record[ogKey].redcap_value.toString();
                const format = storedDataDetails.format;
                let birthYear;

                try {
                  birthYear = extractYearFromDate(dateValue, format);
                  console.log("birthYear", birthYear);
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
    console.log("selectedDatabase", selectedDatabase);
    let personID = checkboxFieldData.person.idTextValue;
    console.log("personid", personID);
    if (!matchedAndMergedRedcapRecords.length) return;

    generateOutputFiles(matchedAndMergedRedcapRecords);

    setExecStatus(true);
    setIsExecuting(false);
  }

  function extractYearFromDate(dateValue, format) {
    // Mapping of common date formats to regex patterns
    const formatPatterns = {
      "YYYY-MM-DD": /(\d{4})-\d{2}-\d{2}/,
      "MM-DD-YYYY": /\d{2}-\d{2}-(\d{4})/,
      "DD-MM-YYYY": /\d{2}-\d{2}-(\d{4})/,
      "MM/DD/YYYY": /\d{2}\/\d{2}\/(\d{4})/,
      "DD/MM/YYYY": /\d{2}\/\d{2}\/(\d{4})/,
      // Add more formats as needed
    };

    const regex = formatPatterns[format];
    if (!regex) {
      throw new Error("Unsupported date format");
    }

    const match = dateValue.match(regex);
    if (match && match[1]) {
      return match[1]; // Return the year
    } else {
      throw new Error("Invalid date value for the given format");
    }
  }

  function processPersonData(item) {
    let gender_concept_id = item.person.male || item.person.female || null;
    let ethnicity_concept_id =
      item.person.hispanic_or_latino || item.person.not_hispanic || null;

    return `INSERT INTO person (person_id, year_of_birth, gender_concept_id, ethnicity_concept_id) VALUES ('${item.person.person_id}', ${item.person.birth_year}, ${gender_concept_id}, ${ethnicity_concept_id});\n`;
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
    return data.map((item) => {
      return {
        person_id: item.person.person_id,
        start_date: item.observation_period.start_date.redcap_value || null,
        end_date: item.observation_period.end_date || null,
      };
    });
  }

  function generateObservationPeriodSQL(observationPeriods) {
    let content = "";
    observationPeriods.forEach((period) => {
      content += `INSERT INTO observation_period (person_id, observation_period_start_date, observation_period_end_date) VALUES ('${period.person_id}', '${period.start_date}', '${period.end_date}');\n`;
    });
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

  // function extractValue(data) {
  //   if (typeof data === "object" && data.hasOwnProperty("redcap_value")) {
  //     return data.redcap_value;
  //   }
  //   return data;
  // }

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
    console.log('the sql content' ,sqlContent)
    // Extract values after the "VALUES" keyword
    const valueMatches = sqlContent.match(/VALUES\s*\(([^)]+)\)/g);

    if (!valueMatches || valueMatches.length < 1) {
      console.error("Invalid SQL content");
      return;
    }

    // Extract the headers only once
    const headerMatch = sqlContent.match(
      /\((person_id, year_of_birth,.*ethnicity_concept_id)\)/
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

  // function downloadExcludedData(data) {
  //   let _dataString = JSON.stringify(data, null, 2);
  //   // Create a Blob with the SQL content
  //   const blob = new Blob([_dataString], {
  //     type: "text/plain;charset=utf-8;",
  //   });

  //   // Create a link and click it to trigger the download
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.setAttribute("download", "excludedData.json");
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }

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
                          {/* <Tooltip title="Import Config" placement="top">
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
                              sx={{ marginTop: "10px", marginLeft: "20px" }}
                            >
                              <DownloadIcon />
                            </Button>
                          </Tooltip> */}

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
