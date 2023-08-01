// FilePicker.js
import React from "react";
import { Box, Button, Container, Divider, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CheckIcon from "@mui/icons-material/Check";
import FormSelect from "./FormSelect";
import Paper from "@mui/material/Paper";
import { useDataContext } from "./context/DataContext";
const { ipcRenderer } = window.require("electron");

function FilePicker(props) {
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
    setSelectedFilename
  } = useDataContext();

  const handleButtonClick = async () => {
    const data = await ipcRenderer.invoke("open-file-dialog");
    console.log("data", data);
    if (data && data.contents.length > 0) {
      setShowREDCapAPIInput(false);
      setSelectedFilename(data.title)
      setColumns(
        Object.keys(data.contents[0]).map((key) => ({ field: key, width: 150 }))
      );
      setRows(data.contents.map((item, index) => ({ id: index, ...item })));
      setInitialLoad(false);
    }
  };

  const handleREDCapAPIButtonClick = () => {
    setShowREDCapAPIInput(true);
    setInitialLoad(false);
    setSelectedFilename('')
  };

  // Rest of your component code...
  return (
    <Container>
      <Button variant="contained" onClick={handleREDCapAPIButtonClick}>
          REDCap API
        </Button>
        <Button
          color="warning"
          sx={{ margin: "10px" }}
          variant="contained"
          onClick={handleButtonClick}
        >
          Local Data Dictionary File
        </Button>
      <Paper elevation={3}>
        
        {initialLoad ? (
          <></>
        ) : showREDCapAPIInput ? (
          <>
            <Divider sx={{}} />
            <Box sx={{ textAlign: "center", marginTop: 1, marginBottom: 1 }}>
              <CheckIcon sx={{ color: "green" }} />
              <br />
              <Typography variant="h6" sx={{ mr: 1 }}>
                REDCap Connectivity
              </Typography>
            </Box>
            <Divider sx={{}} />
            <Box sx={{ marginTop: 1, marginBottom: 1 }}>
              <FormSelect props={props} />
            </Box>
          </>
        ) : (
          <>
          <h3>{selectedFilename}</h3>
            <DataGrid
              rows={rows}
              columns={columns}
              autoHeight
              autoWidth
              initialState={{
                pagination: { paginationModel: { pageSize: 5 } }, // Set pageSize to 5
              }}
              pageSizeOptions={[5, 10, 25]} // Customize pagination options
            />
          </>
        )}
      </Paper>
    </Container>
  );
}

export default FilePicker;
