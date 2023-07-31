import React from "react";
import { Box, Container } from "@mui/material";
import ConnectionsSetup from "../components/ConnectionsSetup";

const ConnectionsSetupPage = () => {
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
          <h1>Connections Setup</h1>
          <ConnectionsSetup />
        </Box>
      </Container>
    </>
  );
};

export default ConnectionsSetupPage;
