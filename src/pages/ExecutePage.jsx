import React, { useState } from "react";
import NavBar from "../components/NavBar";
import { Box, Button, Container, Typography } from "@mui/material";

const ExecutePage = () => {
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
            textAlign: 'center'
          }}
        >
          <h1 sx={{ textAlign: "center" }}>Execute</h1>
          <Button variant="contained" sx={{ alignSelf: "center" }}>
            Create OMOP Records
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default ExecutePage;
