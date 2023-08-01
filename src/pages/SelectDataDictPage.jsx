import React, { useState, useEffect } from "react";
import FilePicker from "../components/FilePicker";
import { Box, Container } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import BootstrapTooltip from "../components/BootstrapTooltip";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";

const SelectDataDictPage = (props) => {
  const [forms, setForms] = useState([]);

  const navigate = useNavigate();

  function handleClick() {
    navigate("/execute");
  }

  function handleClickPrev() {
    navigate("/setupConnections");
  }

  useEffect(() => {
    setForms(["Form 1", "Form 2"]);
  }, []);

  return (
    <>
      {/* <NavBar /> */}
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
            <h1>Select Data Dictionary</h1>
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
          <FilePicker props={props} forms={forms} />
        </Box>
      </Container>
    </>
  );
};

export default SelectDataDictPage;
