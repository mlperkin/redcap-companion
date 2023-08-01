import React, { useState, useEffect } from "react";
import { Box, Button, Container, Typography } from "@mui/material";
import Paper from "@mui/material/Paper";
import { useDataContext } from "../components/context/DataContext";
import { useNavigate, useLocation } from "react-router-dom";
import BootstrapTooltip from "../components/BootstrapTooltip";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import CircularProgress from "@mui/material/CircularProgress";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelIcon from "@mui/icons-material/Cancel";

const ExecutePage = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [checksPassed, setChecksPassed] = useState(0);
  const [isValid, setIsValid] = useState(true); //set true, if any checks fail then set to false
  const navigate = useNavigate();

  let totalChecks = 3; //change how many total checks here

  function handleClickPrev() {
    navigate("/selectDataDict");
  }
  const { selectedFilename, selectedDatabase, isRedcapConnected } =
    useDataContext();

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
  }, []);

  function redcapConnected() {
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
          Not Connected
          <CancelIcon style={{ color: "red", marginLeft: "5px" }} />
        </>
      );
    } else if (isRedcapConnected === null) {
      return (
        <>
          Not Tested
          <CancelIcon style={{ color: "red", marginLeft: "5px" }} />
        </>
      );
    }
  }

  function execute() {
    setIsExecuting(true);
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
          <Box>
            <h1 sx={{ textAlign: "center" }}>Execute</h1>
            <BootstrapTooltip title="Go Prev">
              <ArrowCircleLeftIcon
                onClick={handleClickPrev}
                sx={{ cursor: "pointer" }}
                color="primary"
                fontSize="large"
              />
            </BootstrapTooltip>
          </Box>

          <Container>
            <Paper elevation={3} sx={{ padding: "16px" }}>
              <Typography gutterBottom>
                <strong>Output:</strong>{" "}
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
                    <CancelIcon style={{ color: "red", marginLeft: "5px" }} />
                  </>
                )}
              </Typography>
              <Typography gutterBottom>
                <strong>Data Dictionary:</strong>{" "}
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
                    <CancelIcon style={{ color: "red", marginLeft: "5px" }} />
                  </>
                )}
              </Typography>
              <Typography gutterBottom>
                <strong>REDCap Connectivity Test:</strong> {redcapConnected()}
              </Typography>
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
                    <Typography>Executing...</Typography>{" "}
                  </>
                ) : null}
              </Box>
            </Paper>
          </Container>
        </Box>
      </Container>
    </>
  );
};

export default ExecutePage;
