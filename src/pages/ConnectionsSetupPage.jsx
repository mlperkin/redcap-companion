import React, { useState } from "react";
import NavBar from "../components/NavBar";
import { Container, Typography } from "@mui/material";
import MyAccountAPIKeys from "../components/MyAccountAPIKeys";

const ConnectionsSetupPage = () => {
  return (
    <>
      <NavBar />
      <Container maxWidth="xl">
      <h1>Connections Setup</h1>
        <MyAccountAPIKeys/>
      </Container>
    </>
  );
};

export default ConnectionsSetupPage;
