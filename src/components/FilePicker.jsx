import React, { useState } from "react";
import { Button, Container, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import CheckIcon from "@mui/icons-material/Check";
import FormSelect from "./FormSelect";

const { ipcRenderer } = window.require("electron");

function FilePicker(props) {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showREDCapAPIInput, setShowREDCapAPIInput] = useState(false);

  const handleButtonClick = async () => {
    const data = await ipcRenderer.invoke("open-file-dialog");
    if (data && data.length > 0) {
      setShowREDCapAPIInput(false);
      console.log('cols', Object.keys(data[0]).map((key) => ({ field: key, width: 150 })))
      setColumns(Object.keys(data[0]).map((key) => ({ field: key, width: 150 })));
      setRows(data.map((item, index) => ({ id: index, ...item })));
      setInitialLoad(false);
    }
  };

  const handleREDCapAPIButtonClick = () => {
    setShowREDCapAPIInput(true);
    setInitialLoad(false);
  };

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
      {initialLoad ? (
        <></>
      ) : showREDCapAPIInput ? (
        <>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Typography variant="h6" sx={{ mr: 1 }}>
              REDCap Credentials Check
            </Typography>

            <CheckIcon sx={{ color: "green" }} />
          </div>
          <div>
            <FormSelect props={props} />
          </div>
        </>
      ) : (
        <>
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
    </Container>
  );
}

export default FilePicker;
