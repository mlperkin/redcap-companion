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

// import { ConnectingAirportsOutlined } from "@mui/icons-material";

const { ipcRenderer } = window.require("electron");

const ExecutePage = () => {
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
  } = useDataContext();

  const [checksPassed, setChecksPassed] = useState(0);
  const [isValid, setIsValid] = useState(true); //set true, if any checks fail then set to false
  // const [redcapAPITest, setRedcapAPITest] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [formData, setFormData] = useState({
    redcapAPIKey: "",
    redcapAPIURL: "",
  });
  // const [formDataLoaded, setFormDataLoaded] = useState(false);
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
    navigate("/selectDataDict");
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

  const showExecResults = () => {
    if (execStatus === true) {
      return <Typography>Success!</Typography>;
    } else if (execStatus === false) {
      return <Typography>Failed!</Typography>;
    }
  };

  async function execute() {
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

    //for development
    // setTimeout(() => {
    //   setIsExecuting(false);
    // }, 5000);
  }

  //the steps involved here
  // 1. get all redcap records for selected form
  async function getRedcapRecords() {
    // console.log("get redcap records for this form", selectedFilename);
    // console.log("get records for this redcap instance", formData);
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
    // console.log("match these redcap records", redCapRecords);
    // console.log("with this data", ddData);

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
    if (!matchedAndMergedRedcapRecords.length) return;

    //we now need to iterate through this merged data and generate SQL
    console.log("gen output with this data", matchedAndMergedRedcapRecords);

    const filteredData = matchedAndMergedRedcapRecords.map((item) => {
      let newObj = {};

      // Keep the 'demguid' key-value pair
      if (item.demguid) {
        newObj.demguid = item.demguid;
      }

      // Keep the 'enroll date' key-value pair
      if (item.imp_enroll_date) {
        newObj.imp_enroll_date = item.imp_enroll_date;
      }

      // Keep the 'follw up date' key-value pair
      if (item.imp_followup_date) {
        newObj.imp_followup_date = item.imp_followup_date;
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

    console.log("filteredData", filteredData);

    // generateCSV(matchedAndMergedRedcapRecords);
    // generateJSON(filteredData);
    generateSQLFiles(filteredData);

    setExecStatus(true);
    setIsExecuting(false);
  }

  // function generateCSV(data) {
  //   //csv output
  //   // Generate CSV
  //   const header = Object.keys(data[0]).join(",");
  //   const rows = data.map((row) => Object.values(row).join(",")).join("\n");
  //   const csvContent = header + "\n" + rows;

  //   // Create a Blob with the CSV content
  //   const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  //   // Create a link and click it to trigger the download
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.setAttribute("download", "outputData.csv"); // You can name the file whatever you want
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }

  // function generateJSON(data) {
  //   // Convert data to JSON format with indentation
  //   const jsonContent = JSON.stringify(data, null, 4); // 4 spaces of indentation

  //   // Create a Blob with the JSON content
  //   const blob = new Blob([jsonContent], {
  //     type: "application/json;charset=utf-8;",
  //   });

  //   // Create a link and click it to trigger the download
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.setAttribute("download", "outputData.json"); // Naming the file as .json
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  // }

  function generateSQLFiles(data) {
    //A good rule of thumb is to always create the PERSON table first The VISIT_OCCURRENCE table must be created before the standardized clinical data tables as they all refer to the VISIT_OCCURRENCE_ID

    let personSQLContent = "";
    let observationSQLContent = "";
    let observationPeriodSQLContent = "";
    let excludedData = [];
    // Step 1: Process data to derive earliest start and latest stop for each demguid
    const observationPeriods = {};

    personSQLContent += "DO $$ \nDECLARE \n";
    observationPeriodSQLContent += "DO $$ \nDECLARE \n";
    observationSQLContent += "DO $$ \nDECLARE \n";
    observationSQLContent +=
      "    observation_type_concept_id_val BIGINT := 123456; -- placeholder, replace with correct value\n";

    personSQLContent += "BEGIN\n\n";
    observationSQLContent += "BEGIN\n\n";
    observationPeriodSQLContent += "BEGIN\n\n";
    data.forEach((item) => {
      const demguid = item.demguid;
      const birthDateValue = item.impd_brthdtc.redcap_value;
      let birthYear, birthMonth, birthDay;
      const [year, month, day] = birthDateValue.split("-");
      let dateObj = new Date(year, month - 1, day);
      birthYear = dateObj.getFullYear();
      birthMonth = dateObj.getMonth() + 1;
      birthDay = dateObj.getDate();

      //define min criteria needed for person to exist in tables
      if (!birthYear || !birthDateValue) {
        //this data gets outputted to excludedData.csv file
        // console.log("dropping", item);
        // excludedData.push(item);
        // return;
      }

      // Define possible races and their corresponding values
      const raceValues = [
        { race: "WHITE", value: 8527 },
        { race: "BLACK", value: 8516 },
        { race: "ASIAN", value: 8515 },
      ];

      // Choose a random race from the array
      const randomRaceIndex = Math.floor(Math.random() * raceValues.length);
      const selectedRace = raceValues[randomRaceIndex];

      // Use the selected race's value or default to 0 if not found
      const raceConceptIdPlaceholder = selectedRace ? selectedRace.value : 0;
      //Placerholder data
      const ethnicityConceptIdPlaceholder = 38003564; // adjust this if you have a specific value
      const genderConceptId = "8507";
      if (birthYear && birthDateValue) {
        // Insert into person table
        personSQLContent += `-- Inserting data for demguid = ${demguid} into person table\n`;
        if (birthYear) {
          personSQLContent += `INSERT INTO person (person_id, birth_datetime,  gender_concept_id, year_of_birth, month_of_birth, day_of_birth, race_concept_id, ethnicity_concept_id) VALUES \n`;
          personSQLContent += `('${demguid}', '${birthDateValue}', ${genderConceptId}, ${birthYear}, ${birthMonth}, ${birthDay}, ${raceConceptIdPlaceholder}, ${ethnicityConceptIdPlaceholder});\n\n`;
        } else {
          personSQLContent += `INSERT INTO person (person_id, birth_datetime, gender_concept_id, year_of_birth, race_concept_id, ethnicity_concept_id) VALUES \n`;
          personSQLContent += `('${demguid}', '${birthDateValue}', ${genderConceptId}, ${birthYear}, ${raceConceptIdPlaceholder}, ${ethnicityConceptIdPlaceholder});\n\n`;
        }
      }

      const birthDateConceptId =
        item.impd_brthdtc.mapping_metadata.impd_brthdtc.extraData.concept_id;
      const ageValue = item.imp_age.redcap_value;
      const ageConceptId =
        item.imp_age.mapping_metadata.imp_age.extraData.concept_id;

      // Insert into observation table
      observationSQLContent += `-- Inserting birthDate observation for demguid = ${demguid}\n`;
      observationSQLContent += `INSERT INTO observation (observation_id, person_id, observation_concept_id, value_as_string, observation_date, observation_type_concept_id) \n`;
      observationSQLContent += `VALUES ((SELECT COALESCE(MAX(observation_id), 0) + 1 FROM observation), '${demguid}', ${birthDateConceptId}, '${birthDateValue}', CURRENT_DATE, observation_type_concept_id_val);\n\n`;

      // Insert into observation table
      observationSQLContent += `-- Inserting age observation for demguid = ${demguid}\n`;
      observationSQLContent += `INSERT INTO observation (observation_id, person_id, observation_concept_id, value_as_string, observation_date, observation_type_concept_id) \n`;
      observationSQLContent += `VALUES ((SELECT COALESCE(MAX(observation_id), 0) + 2 FROM observation), '${demguid}', ${ageConceptId}, '${ageValue}', CURRENT_DATE, observation_type_concept_id_val);\n\n`;

      // initialize if not yet done
      if (!observationPeriods[demguid]) {
        observationPeriods[demguid] = {
          start: new Date(item.imp_enroll_date),
          stop: new Date(
            item.imp_followup_date
              ? item.imp_followup_date
              : item.imp_enroll_date
          ),
        };
      } else {
        // Update start if the current item's start is earlier
        if (
          new Date(item.imp_enroll_date) < observationPeriods[demguid].start
        ) {
          observationPeriods[demguid].start = new Date(item.imp_enroll_date);
        }

        // Update stop if the current item's stop is later
        if (
          new Date(item.imp_followup_date) > observationPeriods[demguid].stop
        ) {
          observationPeriods[demguid].stop = new Date(item.imp_followup_date);
        }
      }
    }); //end data loop

    personSQLContent += "END $$;";
    observationSQLContent += "END $$;";

    // Step 2: Create SQL statements for the observation_period table using the derived data
    for (let demguid in observationPeriods) {
      observationPeriodSQLContent += `-- Inserting observation period for demguid = ${demguid}\n`;
      observationPeriodSQLContent += `INSERT INTO observation_period (observation_period_id, person_id, observation_period_start_date, observation_period_end_date, period_type_concept_id) \n`;
      observationPeriodSQLContent += `VALUES ((SELECT COALESCE(MAX(observation_period_id), 0) + 1 FROM observation_period), '${demguid}', '${formatDateToSQL(
        observationPeriods[demguid].start
      )}', '${formatDateToSQL(
        observationPeriods[demguid].stop
      )}', 44814724);\n\n`;
    }
    observationPeriodSQLContent += "END $$;";

    console.log("selectedOMOPTables", selectedOMOPTables);
    if (selectedOMOPTables.includes("person"))
      downloadSQL(personSQLContent, "person.sql");
    if (selectedOMOPTables.includes("observation_period"))
      downloadSQL(observationPeriodSQLContent, "observation_period.sql");
    if (selectedOMOPTables.includes("observation"))
      downloadSQL(observationSQLContent, "observation.sql");
    if (excludedData && excludedData.length) downloadExcludedData(excludedData);
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
            <h1 sx={{ textAlign: "center" }}>Execute</h1>
          </Box>

          <Container>
            <Paper elevation={3} sx={{ padding: "16px" }}>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      <strong>Input Data Dictionary:</strong>
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
              {checksPassed}/{totalChecks} passed
              <br />
              <h3>Output OMOP Tables</h3>
              <OMOPCheckboxes />
              <Button
                disabled={!isValid || isExecuting}
                onClick={execute}
                variant="contained"
                sx={{ marginTop: "10px" }}
              >
                Execute
              </Button>
              <br />
              <Box sx={{ margin: "20px" }}>
                {isExecuting ? (
                  <>
                    <CircularProgress />
                    {executionText()}{" "}
                  </>
                ) : null}

                {showExecResults()}
              </Box>
            </Paper>
          </Container>
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

export default ExecutePage;
