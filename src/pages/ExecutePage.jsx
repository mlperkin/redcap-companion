import React from "react";
import { Box, Button, Container } from "@mui/material";
import Paper from "@mui/material/Paper";
import { useDataContext } from "../components/context/DataContext";
import { useNavigate, useLocation } from "react-router-dom";
import BootstrapTooltip from "../components/BootstrapTooltip";
import ArrowCircleLeftIcon from "@mui/icons-material/ArrowCircleLeft";

const ExecutePage = () => {
  const navigate = useNavigate();
  function handleClickPrev() {
    navigate("/selectDataDict");
  }
  const {
    rows,
    setRows,
    columns,
    setColumns,
    initialLoad,
    setInitialLoad,
    showREDCapAPIInput,
    setShowREDCapAPIInput,
    selectedFilename,
    setSelectedFilename,
  } = useDataContext();

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
          <Box>
            <h1 sx={{ textAlign: "center" }}>Execute</h1>
            <BootstrapTooltip title="Go Prev">
              <ArrowCircleLeftIcon
                onClick={handleClickPrev}
                sx={{ cursor: "pointer" }}
                color="primary"
                fontSize="large"
              />
            </BootstrapTooltip>
          </Box>

          <Container>
            <Paper elevation={3}>
              <h4>{selectedFilename}</h4>
              <Button
                variant="contained"
                sx={{ alignSelf: "center", margin: "10px" }}
              >
                Execute
              </Button>
            </Paper>
          </Container>
        </Box>
      </Container>
    </>
  );
};

export default ExecutePage;
