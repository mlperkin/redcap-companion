import React from "react";
import { Box, Container } from "@mui/material";
import ConnectionsSetup from "../components/ConnectionsSetup";
import ArrowCircleRightIcon from "@mui/icons-material/ArrowCircleRight";
import BootstrapTooltip from "../components/BootstrapTooltip";
import { useNavigate } from "react-router-dom";

const ConnectionsSetupPage = () => {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/selectDataDict");
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
            <ArrowCircleRightIcon
              sx={{ opacity: 0 }}
              color="primary"
              fontSize="large"
            />
            <BootstrapTooltip title="Go Next">
              <ArrowCircleRightIcon
                onClick={handleClick}
                sx={{ cursor: "pointer" }}
                color="primary"
                fontSize="large"
              />
            </BootstrapTooltip>
            <h1>Connections Setup</h1>
          </Box>
          <ConnectionsSetup />
        </Box>
      </Container>
    </>
  );
};

export default ConnectionsSetupPage;
