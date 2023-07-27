import React, { useState } from "react";
import NavBar from "../components/NavBar";
import { Button, Container, Typography } from "@mui/material";

const ExecutePage = () => {
  return (
    <>
      <NavBar />
      <Container maxWidth="xl">
        <h1>Execute</h1>
        <Button variant="contained">Create OMOP Records</Button>
      </Container>
    </>
  );
};

export default ExecutePage;
