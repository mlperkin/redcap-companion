import React, { useState, useEffect } from "react";
import FilePicker from "../components/FilePicker";
import { Box, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BootstrapTooltip from "../components/BootstrapTooltip";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import { decryptData } from "../utils/encryption";
// import { useDataContext } from "../components/context/DataContext";
// import QuoteApp from "./vlist";
// import Todo from "./Todo";
// import Kanban from "./Kanban";

const { ipcRenderer } = window.require("electron");

const MappingDataPage = (props) => {
  const [forms, setForms] = useState([]);
  const [formData, setFormData] = useState();
  const [formDataLoaded, setFormDataLoaded] = useState();
  // const { ddData } = useDataContext();
  const navigate = useNavigate();

  useEffect(() => {
    let redcapAPI = localStorage.getItem("redcapAPIDD");
    if (redcapAPI) {
      // console.log('the dd', ddData)
    }
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

  // This effect runs after formData is updated
  useEffect(() => {
    if (formDataLoaded) {
      // Call your function or add code here that should run after formData is updated
      getForms();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formDataLoaded]); // Run whenever formDataLoaded changes

  function handleClick() {
    navigate("/output");
  }

  function handleClickPrev() {
    navigate("/setupConnections");
  }

  function getForms() {
    var formdata = new FormData();
    // console.log("formdata", formData);
    if (!formData) {
      // console.log("no form data");
      return;
    }
    formdata.append("token", formData.redcapAPIKey);
    formdata.append("content", "metadata");
    formdata.append("format", "json");
    // formdata.append("forms[0]", "bioinformatics_core_activity_survey");

    var requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    fetch(formData.redcapAPIURL, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        // console.log("result", JSON.parse(result));
        if (result) result = JSON.parse(result);
        const uniqueFormNames = [
          ...new Set(result.map((item) => item.form_name)),
        ];

        setForms(uniqueFormNames);
      })
      .catch((error) => console.log("error", error));
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
            <h1>Mapping Data</h1>
          </Box>
          <FilePicker props={props} forms={forms} />
          <Box>
            <BootstrapTooltip title="Go Prev">
              <ArrowCircleLeftIcon
                onClick={handleClickPrev}
                sx={{ cursor: "pointer" }}
                color="primary"
                fontSize="large"
              />
            </BootstrapTooltip>
            <BootstrapTooltip title="Go Next">
              <ArrowCircleRightIcon
                onClick={handleClick}
                sx={{ cursor: "pointer" }}
                color="primary"
                fontSize="large"
              />
            </BootstrapTooltip>
          </Box>
          {/* <QuoteApp/> */}
          {/* <Kanban/> */}
          {/* <Todo/> */}
        </Box>
      </Container>
    </>
  );
};

export default MappingDataPage;
