// FilePicker.js
import React, { useState } from "react";
import { Box, Button, Container, Divider, Typography, Tooltip } from "@mui/material";
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
    setSelectedFilename,
    ddData,
    setDDData,
    setRedcapFormName,
  } = useDataContext();

  const [ddParseErr, setDDParseErr] = useState(false);

  const handleButtonClick = async () => {
    const data = await ipcRenderer.invoke("open-file-dialog");

    console.log("data", data);
    // localStorage.setItem('dd_data', JSON.stringify(data.contents))

    localStorage.setItem("redcapAPIDD", false);
    try {
      if (data && data.contents.length > 0) {
        setDDData([]);
        setDDParseErr(false);
        setSelectedFilename();
        let _formName;
        let onlyMappedData = data.contents.filter((item) => {
          try {
            // Attempt to parse the field_annotation as JSON
            const parsedValue = JSON.parse(item.field_annotation);
            if (item.form_name) _formName = item.form_name;
            return typeof parsedValue === "object" && parsedValue !== null; // Check if the parsed value is an object
          } catch (e) {
            return false; // If parsing failed, exclude this item from the filtered result
          }
        });
        console.log("form name", _formName);
        console.log("onlyMappedData", onlyMappedData);
        // if(!_formName) throw new Error('No form name detected')
        setRedcapFormName(_formName);
        setDDData(onlyMappedData);
        console.log("mappeddata", onlyMappedData);
        setShowREDCapAPIInput(false);

        // setColumns(
        //   Object.keys(onlyMappedData[0]).map((key) => ({
        //     field: key,
        //     width: 150,
        //   }))
        // );
        // setRows(onlyMappedData.map((item, index) => ({ id: index, ...item })));

        // setSelectedFilename(data.title);

        const truncateString = (str, num) => {
          if (str.length <= num) return str;
          return str.slice(0, num) + '...';
        }
        setColumns([
          {
            field: 'field_name',
            headerName: 'Field Name',
            width: 150,
          },
          {
            field: 'field_annotation',
            headerName: 'Field Annotation',
            width: 350,
            renderCell: (params) => (
              <Tooltip title={params.value}>
                <span>
                  {truncateString(params.value, 50)} 
                </span>
              </Tooltip>
            ),
          },
        ]);
   
        
        
        
        setRows(onlyMappedData.map((item, index) => ({ id: index, ...item })));

        setInitialLoad(false);
      }
    } catch (error) {
      console.log("error", error);
      setDDData([]);
      setSelectedFilename("");
      console.log("clear cols and rwos");
      setColumns([]);
      setRows([]);
      setDDParseErr(true);
    }
  };

  const handleREDCapAPIButtonClick = () => {
    localStorage.setItem("dd_data", "");
    setShowREDCapAPIInput(true);
    setInitialLoad(false);
    setSelectedFilename("");
    setDDData([]);
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
        Local Mapped File
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
            {ddData && (
              <>
                <h3>{selectedFilename}</h3>
                <Typography>Mapped Data Found</Typography>
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
          </>
        )}
        {ddParseErr && <Typography>Error parsing data dictionary</Typography>}
      </Paper>
    </Container>
  );
}

export default FilePicker;
