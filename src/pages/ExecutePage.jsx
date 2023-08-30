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
  } = useDataContext();

  const [checksPassed, setChecksPassed] = useState(0);
  const [isValid, setIsValid] = useState(true); //set true, if any checks fail then set to false
  // const [redcapAPITest, setRedcapAPITest] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [formData, setFormData] = useState({
    redcapAPIKey: "",
    redcapAPIURL: "",
  });
  const [formDataLoaded, setFormDataLoaded] = useState(false);
  const [dbCreds, setDBCreds] = useState();
  const [mergedData, setMergedData] = useState([]);

  const navigate = useNavigate();

  let totalChecks = 4; //how many total checks here

  // Function to load the data
  useEffect(() => {
    setFormDataLoaded(false);
    // Request the store data from the main process when the component mounts
    ipcRenderer.invoke("getStoreData").then((data) => {
      const redcapDecryptedData = decryptData(data.redcapFormData); // Decrypt the data
      const mysqlDecryptedData = decryptData(data.MySQLForm); // Decrypt the data
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
      setFormDataLoaded(true);
    });
  }, []);

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
    event.preventDefault();
    setIsTesting(true);
    const { redcapAPIKey, redcapAPIURL } = formData;
    if (!redcapAPIKey || !redcapAPIURL) {
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
    setExecStatus(false);

    //the steps involved here
    // 1. get all redcap records for selected form
    let redCapRecords = await getRedcapRecords();
    // 2. match redcap records field_names with field_names from data dictionary and merge these two together
    let mergedRedcapRecords = await matchAndMergeRedcapRecords(redCapRecords);
    // 3. iterate through this merged list to create SQL CSV files (for upsert on mysql and postgresql)
    // setMergedData(mergedRedcapRecords);
    await generateOutput(mergedRedcapRecords);

    //for development
    setTimeout(() => {
      setIsExecuting(false);
    }, 5000);
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

    if(!redCapRecords) return;

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

    const filteredData = matchedAndMergedRedcapRecords.map(item => {
      let newObj = {};
    
      // Keep the 'demguid' key-value pair
      if (item.demguid) {
        newObj.demguid = item.demguid;
      }
    
      // Check each key in the object to see if it has an object with 'redcap_value' as a key
      for (let key in item) {
        if (item[key] && typeof item[key] === 'object' && item[key].hasOwnProperty('redcap_value')) {
          newObj[key] = item[key];
        }
      }
    
      return newObj;
    });
    
    console.log('filteredData', filteredData);

    // generateCSV(matchedAndMergedRedcapRecords);
    // generateJSON(filteredData);
    generateSQL(filteredData)
    
    setExecStatus(true);
    setIsExecuting(false);
  }

  function generateCSV(data) {
    //csv output
    // Generate CSV
    const header = Object.keys(data[0]).join(",");
    const rows = data.map((row) => Object.values(row).join(",")).join("\n");
    const csvContent = header + "\n" + rows;

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Create a link and click it to trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "outputData.csv"); // You can name the file whatever you want
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function generateJSON(data) {
    // Convert data to JSON format with indentation
    const jsonContent = JSON.stringify(data, null, 4); // 4 spaces of indentation

    // Create a Blob with the JSON content
    const blob = new Blob([jsonContent], {
      type: "application/json;charset=utf-8;",
    });

    // Create a link and click it to trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "outputData.json"); // Naming the file as .json
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function generateSQL(data) {
    let sqlContent = "";

    data.forEach(item => {
        const demguid = item.demguid;
        const birthDateValue = item.impd_brthdtc.redcap_value;
        
        // Insert into person table
        sqlContent += `-- Inserting data for demguid = ${demguid} into person table\n`;
        sqlContent += `INSERT INTO person (person_id, birth_date) VALUES \n`;
        sqlContent += `('${demguid}', '${birthDateValue}');\n\n`;

        const birthDateConceptId = item.impd_brthdtc.mapping_metadata.impd_brthdtc.extraData.concept_id;
        const ageValue = item.imp_age.redcap_value;
        const ageConceptId = item.imp_age.mapping_metadata.imp_age.extraData.concept_id;

        // Insert into observations table
        sqlContent += `-- Inserting observations for demguid = ${demguid}\n`;
        sqlContent += `INSERT INTO observations (demguid, concept_id, value_as_string, date_recorded) VALUES \n`;
        sqlContent += `('${demguid}', ${birthDateConceptId}, '${birthDateValue}', CURRENT_DATE),\n`;
        sqlContent += `('${demguid}', ${ageConceptId}, '${ageValue}', CURRENT_DATE);\n\n`;
    });

    // Create a Blob with the SQL content
    const blob = new Blob([sqlContent], {
        type: "text/plain;charset=utf-8;",
    });

    // Create a link and click it to trigger the download
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "outputData.sql");
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
