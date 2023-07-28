import React, { useState } from "react";
import NavBar from "../components/NavBar";
import { Box, Container, Typography } from "@mui/material";
import MyAccountAPIKeys from "../components/MyAccountAPIKeys";

const ConnectionsSetupPage = () => {
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
          <h1>Connections Setup</h1>
          <MyAccountAPIKeys />
        </Box>
      </Container>
    </>
  );
};

export default ConnectionsSetupPage;
