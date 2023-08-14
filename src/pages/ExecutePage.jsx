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
  } = useDataContext();

  const [checksPassed, setChecksPassed] = useState(0);
  const [isValid, setIsValid] = useState(true); //set true, if any checks fail then set to false
  const [redcapAPITest, setRedcapAPITest] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [formData, setFormData] = useState({
    redcapAPIKey: "",
    redcapAPIURL: "",
  });
  const [formDataLoaded, setFormDataLoaded] = useState(false);

  const navigate = useNavigate();

  let totalChecks = 3; //how many total checks here

  // Function to load the data
  useEffect(() => {
    setFormDataLoaded(false);
    // Request the store data from the main process when the component mounts
    ipcRenderer.invoke("getStoreData").then((data) => {
      const decryptedData = decryptData(data.redcapFormData); // Decrypt the data
      if (decryptedData) {
        setFormData(decryptedData);
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

    if (selectedFilename) passedChecks++;

    setIsValid(passedChecks === totalChecks); // Set to true if all checks pass
    // Set the number of checks that passed to display the fraction (e.g., "1/2")
    setChecksPassed(passedChecks);
  }, [isRedcapConnected, selectedFilename, selectedDatabase, totalChecks]);

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
      setRedcapAPITest("Please provide both API key and URL.");
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

  function execute() {
    setIsExecuting(true);

    //for development
    setTimeout(() => {
      setIsExecuting(false);
    }, 5000);
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
                      <strong>Output:</strong>
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
                      <strong>Data Dictionary:</strong>
                    </TableCell>
                    <TableCell>
                      {selectedFilename ? (
                        <>
                          {selectedFilename}
                          <CheckCircleOutlineIcon
                            style={{ color: "green", marginLeft: "5px" }}
                          />
                        </>
                      ) : (
                        <>
                          Please select a REDCap data dictionary
                          <CancelIcon
                            style={{ color: "red", marginLeft: "5px" }}
                          />
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <strong>REDCap Connectivity Test:</strong>
                    </TableCell>
                    <TableCell>{redcapConnected()}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <Divider />
              {checksPassed}/{totalChecks} checks passed
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
       
      </Container>
    </>
  );
};

export default ExecutePage;
