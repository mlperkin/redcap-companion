// FilePicker.js
import React, { useState } from "react";
import { Box, Button, Container, Divider, Typography } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import FormSelect from "./FormSelect";
import Paper from "@mui/material/Paper";
import { useDataContext } from "./context/DataContext";
import { MaterialReactTable } from "material-react-table";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Alert, Snackbar } from "@mui/material";

const { ipcRenderer } = window.require("electron");

function FilePicker(props) {
  const theme = useTheme();

  const {
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
    tablesData,
    setTablesData,
    setRedcapFormName,
  } = useDataContext();

  const [ddParseErr, setDDParseErr] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const checklistData = [
    { id: 5929, label: "Birth Year" },
    { id: 8507, label: "Male" },
    { id: 8532, label: "Female" },
    { id: 38003563, label: "Hispanic or Latino" },
    { id: 38003564, label: "Not Hispanic" },

    // ... you can add more here later
  ];

  const isIdPresentInTablesData = (id) => {
    if (tablesData.length) {
      console.log("tablesData", tablesData[0]);
      console.log("tablesData2", tablesData[0].data[0].field_annotation);
    }

    return tablesData.some((table, tableIndex) => {
      console.log(`Processing table ${tableIndex}:`, table);

      return table.data.some((row, rowIndex) => {
        console.log(`Row ${rowIndex} field_annotation:`, row.field_annotation);

        let parsedAnnotation;
        try {
          parsedAnnotation = JSON.parse(row.field_annotation);
        } catch (error) {
          console.error(
            `Error parsing field_annotation for row ${rowIndex}:`,
            error
          );
          return false; // continue to next row if there's an error
        }

        // Process each property of the parsedAnnotation
        for (const property in parsedAnnotation) {
          console.log(
            `Property "${property}" of parsedAnnotation for row ${rowIndex}:`,
            parsedAnnotation[property]
          );

          const extraData = parsedAnnotation[property]?.extraData;
          console.log(
            `Extracted extraData for property "${property}" of row ${rowIndex}:`,
            extraData
          );

          const conceptId = extraData?.concept_id;
          console.log(
            `concept_id for property "${property}" of row ${rowIndex}:`,
            conceptId
          );

          if (conceptId === id) {
            console.log(
              `Match found for concept_id in property "${property}" of row ${rowIndex}`
            );
            return true;
          }
        }

        console.log(`No match found for row ${rowIndex}`);
        return false;
      });
    });
  };

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
        let _formName, _fileName;
        if (data.title) _fileName = data.title;
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
        if (!onlyMappedData.length) {
          //show error notification here
          setOpenSnackbar(true);
          return;
        }
        setRedcapFormName(_formName);
        setDDData(onlyMappedData);
        setShowREDCapAPIInput(false);

        const newColumns = [
          {
            header: "Field Name",
            accessorKey: "field_name",
          },
          {
            header: "Field Annotation",
            accessorKey: "field_annotation",
            Cell: ({ row }) => (
              <AnnotationCell
                annotation={row.original.field_annotation}
                row={row}
              />
            ),
          },
          {
            header: "Mapped To",
            accessorKey: "field_annotation.extraData.concept_id",
            Cell: ({ row }) => (
              <MappedCell
                annotation={row.original.field_annotation}
                row={row}
              />
            ),
          },
          {
            header: "Domain",
            accessorKey: "field_annotation.extraData['Domain ID']",
            Cell: ({ row }) => (
              <DomainCell
                annotation={row.original.field_annotation}
                row={row}
              />
            ),
          },
        ];

        // after extracting onlyMappedData, instead of setDDData(onlyMappedData)
        const newTableData = {
          filename: _fileName || _formName || "Untitled",
          data: onlyMappedData,
          columns: newColumns,
          rows: onlyMappedData.map((item, index) => ({ id: index, ...item })),
        };
        setTablesData((prev) => [...prev, newTableData]);

        setColumns(newColumns);
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

  const removeTable = (indexToRemove) => {
    setTablesData((prevData) =>
      prevData.filter((_, index) => index !== indexToRemove)
    );
  };

  function AnnotationCell({ annotation, row }) {
    // Parse the annotation JSON
    // console.log("annot", annotation);
    // console.log("row", row);
    const parsedAnnotation = JSON.parse(annotation);

    // If the annotation is an object, display its items on separate lines
    if (parsedAnnotation && typeof parsedAnnotation === "object") {
      return (
        <div>
          {Object.values(parsedAnnotation).map((item, index) => (
            <React.Fragment key={index}>
              {item["Field Label"]} {item["extraData"]["og_field_name_key"]}
              <br />
            </React.Fragment>
          ))}
        </div>
      );
    }

    return <div>{annotation}</div>;
  }

  function MappedCell({ annotation, row }) {
    // Parse the annotation JSON
    // console.log("annot", annotation);
    // console.log("row", row);
    const parsedAnnotation = JSON.parse(annotation);

    // If the annotation is an object, display its items on separate lines
    if (parsedAnnotation && typeof parsedAnnotation === "object") {
      return (
        <div>
          {Object.values(parsedAnnotation).map((item, index) => (
            <React.Fragment key={index}>
              {item["SNOMED Name"]} - {item["extraData"]["concept_id"]}
              <br />
            </React.Fragment>
          ))}
        </div>
      );
    }

    return <div>{annotation}</div>;
  }

  function DomainCell({ annotation, row }) {
    // Parse the annotation JSON
    // console.log("annot", annotation);
    // console.log("row", row);
    const parsedAnnotation = JSON.parse(annotation);

    // If the annotation is an object, display its items on separate lines
    if (parsedAnnotation && typeof parsedAnnotation === "object") {
      return (
        <div>
          {Object.values(parsedAnnotation).map((item, index) => (
            <React.Fragment key={index}>
              {item["Domain ID"]}
              <br />
            </React.Fragment>
          ))}
        </div>
      );
    }

    return <div>{annotation}</div>;
  }

  return (
    // <Container>
    <Grid container spacing={3}>
      {/* Checklist Column */}
      <Grid item xs={3}>
        <Paper elevation={3}>
          <h3>Required Mappings</h3>
          <List>
            {checklistData.map((item) => (
              <ListItem key={item.id}>
                <ListItemIcon>
                  {isIdPresentInTablesData(item.id) ? (
                    <CheckIcon style={{ color: theme.palette.success.main }} />
                  ) : (
                    <CloseIcon style={{ color: theme.palette.error.main }} />
                  )}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>
      <Grid item xs={9}>
        <Button variant="contained" onClick={handleREDCapAPIButtonClick}>
          REDCap API
        </Button>
        <Button
          color="success"
          sx={{ margin: "10px" }}
          variant="contained"
          onClick={handleButtonClick}
        >
          Add Local Mapped File
        </Button>

        {initialLoad ? (
          <></>
        ) : showREDCapAPIInput ? (
          <>
            <Paper elevation={3}>
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
            </Paper>
          </>
        ) : (
          <>
            {tablesData.map((table, index) => (
              <Box mb={3} key={index}>
                {" "}
                {/* This introduces margin-bottom spacing between each Paper */}
                <Paper elevation={3}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 16px", // Added padding for better spacing inside Paper
                    }}
                  >
                    <h3 style={{ margin: 0 }}>{table.filename}</h3>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => removeTable(index)}
                      style={{
                        color: theme.palette.error.main,
                        marginRight: "10px",
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </div>
                  <Typography
                    variant="h6"
                    gutterBottom
                    style={{ paddingLeft: "16px" }}
                  >
                    OMOP Mapped Data Found
                  </Typography>
                  <MaterialReactTable
                    columns={table.columns}
                    data={table.data}
                  />
                </Paper>
              </Box>
            ))}
          </>
        )}
        {ddParseErr && <Typography>Error parsing data dictionary</Typography>}
        <Snackbar
          open={openSnackbar}
          autoHideDuration={5000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity="error"
            variant="filled"
          >
            No mapped data found!
          </Alert>
        </Snackbar>
      </Grid>
    </Grid>
  );
}

export default FilePicker;
