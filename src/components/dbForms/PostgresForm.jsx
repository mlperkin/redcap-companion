import React from "react";
import Grid from "@mui/material/Grid";
import { useState, useEffect } from "react";
import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
// import CheckIcon from "@mui/icons-material/Check";
// import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import InputAdornment from "@mui/material/InputAdornment";

export default function PostgresForm({ props }) {
  const [pgHostName, setPGHostName] = useState("");
  const [editModePGHostname, setEditModeMyPGHostname] = useState();
  const [pgDBTest, setPGDBTest] = useState(false);

  function handleFormSubmit() {}

  function handleCancel() {}

  function handleEdit() {}

  function testDBConnection() {}

  return (
    // <Paper elevation={3}>
    <>
      <Box sx={{ textAlign: "center" }}>
        <h3>Postgres Database Credentials</h3>
      </Box>
      <Box
        component="form"
        onSubmit={(event) => handleFormSubmit(event, "postgres")}
        value="postgres"
        sx={{
          justifyContent: "center",
          display: "flex",
          flexWrap: "wrap",
          padding: "30px",
        }}
      >
        <TextField
          InputLabelProps={{ shrink: true }}
          disabled={!editModePGHostname}
          onChange={(event) => setPGHostName(event.target.value)}
          value={pgHostName}
          margin="normal"
          required
          fullWidth
          name="hostname"
          label="Postgres Database Hostname"
          type="text"
          id="hostname"
          InputProps={{
            endAdornment: (
              <>
                {!editModePGHostname ? (
                  <InputAdornment position="end">
                    <IconButton onClick={() => handleEdit("hostname")}>
                      <EditIcon />
                    </IconButton>
                  </InputAdornment>
                ) : (
                  <>
                    <InputAdornment position="end">
                      <IconButton type="submit">
                        <CheckIcon />
                      </IconButton>
                    </InputAdornment>
                    <InputAdornment position="end">
                      <IconButton
                        disabled={!editModePGHostname}
                        onClick={() => handleCancel("hostname")}
                      >
                        <CancelIcon />
                      </IconButton>
                    </InputAdornment>
                  </>
                )}
              </>
            ),
          }}
        />
      </Box>

      <Grid item xs={12}>
        <Box sx={{ display: "block", textAlign: "center", marginTop: "10px" }}>
          <Button
            onClick={(event) => testDBConnection(event)}
            variant="outlined"
            value="hostname"
            sx={{
              ml: 4,
              padding: "10px 30px 10px 30px",
              maxHeight: "60px",
              backgroundColor: "theme.primary.main",
            }}
          >
            Test DB Connection
          </Button>
        </Box>
      </Grid>
      <Grid item xs={12}>
        <Box sx={{ display: "block", marginTop: "10px" }}>
          <Typography>{pgDBTest}</Typography>
        </Box>
      </Grid>
    </>
    // </Paper>
  );
}
