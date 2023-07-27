import React, { useState } from "react";
import NavBar from "../components/NavBar";
import FilePicker from "../components/FilePicker";
import { Button, Container, Typography } from "@mui/material";

const SelectDataDictPage = (props) => {
  const [forms, setForms] = useState(["Form 1", "Form 2"]);

  return (
    <>
      <NavBar />
      <Container maxWidth="xl">
        <h1>Select Data Dictionary</h1>
        <FilePicker props={props} forms={forms} />
      </Container>
    </>
  );
};

export default SelectDataDictPage;
