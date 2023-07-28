import React from "react";
import { Box, Button, Container } from "@mui/material";
import Paper from "@mui/material/Paper";
const ExecutePage = () => {
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
          <h1 sx={{ textAlign: "center" }}>Execute</h1>
          <Container>
            <Paper elevation={3}>
              <Button variant="contained" sx={{ alignSelf: "center", margin: '10px' }}>
                Create OMOP Records
              </Button>
            </Paper>
          </Container>
        </Box>
      </Container>
    </>
  );
};

export default ExecutePage;
