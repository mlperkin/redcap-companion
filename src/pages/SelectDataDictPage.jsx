import React, { useState, useEffect } from "react";
import FilePicker from "../components/FilePicker";
import { Box, Container } from "@mui/material";

const SelectDataDictPage = (props) => {
  const [forms, setForms] = useState([]);

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
          <h1>Select Data Dictionary</h1>
          <FilePicker props={props} forms={forms} />
        </Box>
      </Container>
    </>
  );
};

export default SelectDataDictPage;
