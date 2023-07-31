import React from "react";
import Grid from "@mui/material/Grid";
import { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
// import CheckIcon from "@mui/icons-material/Check";
// import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import InputAdornment from "@mui/material/InputAdornment";
import DatabaseDropdown from "./dbForms/DatabaseDropdown";
import MySQLForm from "./dbForms/MySQLForm";
import PostgresForm from "./dbForms/PostgresForm";
import { encryptData, decryptData } from "../utils/encryption";
import CsvExportIcon from "../icons/csvExport.png";

export default function MyAccountAPIKeys(props) {
  // console.log("adminsec", props);
  const [redcapKey, setRedcapKey] = useState("");
  const [redcapURL, setRedcapURL] = useState("");
  const [prevRedcapURL, setPrevRedcapURL] = useState("");
  const [umlsKey, setUMLSKey] = useState("");
  const [gpt3Key, setGPT3Key] = useState("");
  const [editModeRedcapKey, setEditModeRedcapKey] = useState(false);
  const [editModeRedcapURL, setEditModeRedcapURL] = useState(false);
  const [editModeUMLS, setEditModeUMLS] = useState();
  const [editModeGPT3, setEditModeGPT3] = useState();
  // const [error, setError] = useState(false);
  const [redcapAPITest, setRedcapAPITest] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState("");
  // let propsUserObj = JSON.parse(props.props.props.user);
  // let propsToken = props.props.props.token;

  // useEffect(() => {
  //   // checkExistingKeys();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [propsToken]);

  // Load the saved form data from localStorage on component mount
  useEffect(() => {
    // if (!formDataLoaded) {
    const selectedDB = localStorage.getItem("selectedDB");
    if (selectedDB) setSelectedDatabase(selectedDB);
    // }
  }, []);

  function checkExistingKeys() {
    //   //check for existing keys
    //   var myHeaders = new Headers();
    //   myHeaders.append("Authorization", "Bearer " + propsToken);
    //   var requestOptions = {
    //     method: "GET",
    //     headers: myHeaders,
    //     redirect: "follow",
    //     credentials: "include", // Include cookies with the request
    //   };
    //   fetch(
    //     `${process.env.REACT_APP_BACKEND_API_URL}/api/keys/queryAllKeys`,
    //     requestOptions
    //   )
    //     .then((response) => {
    //       return response.text();
    //     })
    //     .then((result) => {
    //       // console.log("result", result);
    //       let resultObj = JSON.parse(result);
    //       const redcapKeyResult = resultObj.find(
    //         (api) => api.name === "redcapAPIKey"
    //       );
    //       const redcapURLResult = resultObj.find(
    //         (api) => api.name === "redcapAPIURL"
    //       );
    //       const umlsResult = resultObj.find((api) => api.name === "umlsAPIKey");
    //       const gpt3Result = resultObj.find((api) => api.name === "gpt3APIKey");
    //       if (redcapKeyResult) {
    //         setRedcapKey("****************");
    //         // console.log("redcapresult", redcapKeyResult);
    //       }
    //       if (redcapURLResult) {
    //         // console.log("url result", redcapURLResult);
    //         setRedcapURL(redcapURLResult.endpoints);
    //       }
    //       if (umlsResult) {
    //         setUMLSKey("****************");
    //       }
    //       if (gpt3Result) {
    //         setGPT3Key("****************");
    //       }
    //     })
    //     .catch((error) => console.log("error", error));
  }

  const handleAPIKeySubmit = (event, formName) => {
    //   event.preventDefault();
    //   // console.log("form", formName);
    //   // console.log("event", event.target[formName].value);
    //   var myHeaders = new Headers();
    //   myHeaders.append("Authorization", "Bearer " + propsToken);
    //   var formdata = new FormData();
    //   formdata.append("name", formName);
    //   if (formName !== "redcapAPIURL")
    //     formdata.append("apiKey", event.target[formName].value);
    //   // if (formName === "umlsAPIKey")
    //   // formdata.append("apiKey", event.target[formName].value);
    //   if (formName === "redcapAPIURL")
    //     formdata.append("endpoints", event.target.redcapAPIURL.value);
    //   var requestOptions = {
    //     method: "POST",
    //     headers: myHeaders,
    //     body: formdata,
    //     redirect: "follow",
    //     credentials: "include", // Include cookies with the request
    //   };
    //   fetch(
    //     `${process.env.REACT_APP_BACKEND_API_URL}/api/keys/updateAPIKey`,
    //     requestOptions
    //   )
    //     .then((response) => {
    //       // console.log("respons", response.status);
    //       if (response.status === 200) {
    //         if (formName === "redcapAPIKey") {
    //           // console.log("set redcap key2");
    //           setRedcapKey("****************");
    //           setEditModeRedcapKey(false);
    //         }
    //         if (formName === "redcapAPIURL") {
    //           // setRedcapKey("****************");
    //           setEditModeRedcapURL(false);
    //         }
    //         if (formName === "umlsAPIKey") {
    //           setUMLSKey("****************");
    //           setEditModeUMLS(false);
    //         }
    //         if (formName === "gpt3APIKey") {
    //           setGPT3Key("****************");
    //           setEditModeGPT3(false);
    //         }
    //       } else {
    //         // setError(true);
    //       }
    //     })
    //     .catch((error) => console.log("error", error));
  };

  const handleEdit = (event) => {
    if (event.target) event.preventDefault();
    console.log("handle key edit", event);
    // console.log("event.!!", event.target.value);

    let _value;
    if (event.target) {
      _value = event.target.value;
    } else {
      _value = event;
    }

    switch (_value) {
      case "redcapAPIKey": {
        // console.log("set redcap key3");
        setRedcapKey("");
        setEditModeRedcapKey(true);
        break;
      }
      case "redcapAPIURL": {
        setPrevRedcapURL(redcapURL);
        // setRedcapURL("");
        setEditModeRedcapURL(true);
        break;
      }
      case "umlsAPIKey": {
        setUMLSKey("");
        setEditModeUMLS(true);
        break;
      }
      case "gpt3APIKey": {
        setGPT3Key("");
        setEditModeGPT3(true);
        break;
      }
      default: {
        break;
      }
    }
  };

  const handleCancel = (event) => {
    if (event.target) event.preventDefault();
    // console.log("handle cancel", event.target.value);

    let _value;
    if (event.target) {
      _value = event.target.value;
    } else {
      _value = event;
    }
    switch (_value) {
      case "redcapAPIKey": {
        // console.log("redcap key", redcapKey);
        if (redcapKey) {
          // console.log("setting redcap key");
          setRedcapKey("****************");
        }
        setEditModeRedcapKey(false);
        break;
      }
      case "redcapAPIURL": {
        if (redcapURL) setRedcapURL(prevRedcapURL);
        setEditModeRedcapURL(false);
        break;
      }
      case "umlsAPIKey": {
        // console.log("umls key", umlsKey);
        if (umlsKey) setUMLSKey("****************");
        setEditModeUMLS(false);
        break;
      }
      case "gpt3APIKey": {
        // console.log("gpt3 key", gpt3Key);
        if (gpt3Key) setGPT3Key("****************");
        setEditModeGPT3(false);
        break;
      }
      default: {
        break;
      }
    }

    checkExistingKeys();
  };

  const handleDBChange = (event) => {
    console.log("db change", event.target.value);
    setSelectedDatabase(event.target.value);
    localStorage.setItem("selectedDB", event.target.value);
  };

  const testRedcapAPI = (event) => {
    //   // event.preventDefault();
    //   // console.log("test redcap api");
    //   var myHeaders = new Headers();
    //   myHeaders.append("Authorization", "Bearer " + propsToken);
    //   var requestOptions = {
    //     method: "GET",
    //     headers: myHeaders,
    //     redirect: "follow",
    //     credentials: "include", // Include cookies with the request
    //   };
    //   fetch(
    //     `${process.env.REACT_APP_BACKEND_API_URL}/api/keys/testRedcapAPI`,
    //     requestOptions
    //   )
    //     .then((response) => {
    //       // console.log("response stat", response.status);
    //       if (response.status !== 200) {
    //         throw new Error();
    //       }
    //       return response.text();
    //     })
    //     .then((result) => {
    //       // console.log(result);
    //       setRedcapAPITest("REDCap API Connected!");
    //     })
    //     .catch((error) => {
    //       console.log("error", error);
    //       setRedcapAPITest("Error: Unable to connect.");
    //     });
  };

  // Function to render the appropriate database form based on selectedDatabase value
  const renderDatabaseForm = () => {
    switch (selectedDatabase) {
      case "None - Export to CSV files":
        return (
          <Box sx={{margin: '30px'}}>
            <img src={CsvExportIcon} width='100px' height='auto' alt="CSV Export Icon" />
          </Box>
        );
      case "MySQL":
        return <MySQLForm />;
      case "PostgreSQL":
        return <PostgresForm />;

      // Add other cases for other database forms
      default:
        return null;
    }
  };

  return (
    <>
      {/* <Grid> */}
      {/* <h1
          style={{
            paddingLeft: "20px",
            textAlign: "center",
            backgroundColor: "rgb(251 251 251)",
          }}
        >
          Admin API Keys
        </h1> */}
      {/* </Grid> */}

      <Grid container spacing={1} sx={{ margin: "30px" }}>
        {/* REDCAP KEY */}

        <Grid
          item
          xs={12}
          lg={3}
          sx={{
            display: "flex",
            // alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            margin: "20px",
            // padding: "30px",
            // margin: '30px'
          }}
        >
          <Paper elevation={3} sx={{ padding: "10px" }}>
            <Box sx={{ textAlign: "center" }}>
              <h3>REDCap Credentials</h3>
            </Box>

            <Box
              component="form"
              onSubmit={(event) => handleAPIKeySubmit(event, "redcapAPIKey")}
              value="redcapAPIKey"
              sx={{
                justifyContent: "center",
                display: "flex",
                flexWrap: "wrap",
                padding: "30px",
              }}
            >
              <TextField
                InputLabelProps={{ shrink: true }}
                disabled={!editModeRedcapKey}
                onChange={(event) => setRedcapKey(event.target.value)}
                value={redcapKey}
                margin="normal"
                required
                minLength="10"
                fullWidth
                name="redcapAPIKey"
                label="REDCap API Key"
                type="password"
                id="redcapAPIKey"
                InputProps={{
                  endAdornment: (
                    <>
                      {!editModeRedcapKey ? (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => handleEdit("redcapAPIKey")}
                          >
                            <EditIcon />
                          </IconButton>
                        </InputAdornment>
                      ) : (
                        <>
                          <InputAdornment position="end">
                            <IconButton type="submit">
                              <CheckIcon />
                            </IconButton>
                          </InputAdornment>
                          <InputAdornment position="end">
                            <IconButton
                              disabled={!editModeRedcapKey}
                              onClick={() => handleCancel("redcapAPIKey")}
                            >
                              <CancelIcon />
                            </IconButton>
                          </InputAdornment>
                        </>
                      )}
                    </>
                  ),
                }}
              />
            </Box>

            {/* REDCAP URL */}
            <Box
              component="form"
              onSubmit={(event) => handleAPIKeySubmit(event, "redcapAPIURL")}
              value="redcapAPIURL"
              sx={{
                justifyContent: "center",
                display: "flex",
                flexWrap: "wrap",
                padding: "30px",
              }}
            >
              <TextField
                InputLabelProps={{ shrink: true }}
                disabled={!editModeRedcapURL}
                value={redcapURL}
                onChange={(event) => setRedcapURL(event.target.value)}
                margin="normal"
                required
                fullWidth
                name="redcapAPIURL"
                label="REDCap API URL"
                type="text"
                id="redcapAPIURL"
                InputProps={{
                  endAdornment: (
                    <>
                      {!editModeRedcapURL ? (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={(event) => handleEdit("redcapAPIURL")}
                          >
                            <EditIcon />
                          </IconButton>
                        </InputAdornment>
                      ) : (
                        <>
                          <InputAdornment position="end">
                            <IconButton type="submit">
                              <CheckIcon />
                            </IconButton>
                          </InputAdornment>
                          <InputAdornment position="end">
                            <IconButton
                              disabled={!editModeRedcapURL}
                              onClick={(event) => handleCancel("redcapAPIURL")}
                            >
                              <CancelIcon />
                            </IconButton>
                          </InputAdornment>
                        </>
                      )}
                    </>
                  ),
                }}
              />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <Button
                onClick={(event) => testRedcapAPI(event)}
                variant="outlined"
                value="redcapAPIKey"
                sx={{
                  ml: 4,
                  padding: "10px 30px 10px 30px",
                  maxHeight: "60px",
                  marginTop: "auto", // Add this line
                }}
              >
                Test REDCap API
              </Button>
              <Grid item xs={12}>
                <Box sx={{ display: "block", marginTop: "10px" }}>
                  <Typography>{redcapAPITest}</Typography>
                </Box>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* DB INFO */}

        <Grid
          item
          xs={12}
          lg={4}
          sx={{
            // display: "flex",
            // alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            // margin: "20px",
            padding: "30px",
            margin: "30px",
          }}
        >
          <Paper elevation={3} sx={{ padding: "10px" }}>
            {/* Determine which db form to use here with dropdown selected value */}
            <Box sx={{ textAlign: "center" }}>
              <h3>Database Credentials</h3>
            </Box>
            <DatabaseDropdown
              handleDBChange={handleDBChange}
              selectedDatabase={selectedDatabase}
            />
          </Paper>
        </Grid>

        <Grid
          item
          xs={12}
          lg={3}
          sx={{
            justifyContent: "center",
            display: "flex",
            flexWrap: "wrap",
            margin: "20px",
          }}
        >
          <Paper elevation={3}>
            {/* Determine which db form to use here with dropdown selected value */}

            {renderDatabaseForm()}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
}
