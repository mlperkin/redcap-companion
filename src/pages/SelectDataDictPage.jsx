import React, { useState } from "react";
import NavBar from "../components/NavBar";
import FilePicker from "../components/FilePicker";
import { Box, Button, Container, Typography } from "@mui/material";

const SelectDataDictPage = (props) => {
  const [forms, setForms] = useState(["Form 1", "Form 2"]);

  return (
    <>
      <NavBar />
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
