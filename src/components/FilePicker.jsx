// FilePicker.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Divider,
  Typography,
  TextField,
  Tooltip,
  Select,
  MenuItem,
} from "@mui/material";
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
import UploadIcon from "@mui/icons-material/Upload";
import DownloadIcon from "@mui/icons-material/Download";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const { ipcRenderer } = window.require("electron");

function FilePicker(props) {
  const theme = useTheme();

  const {
    setRows,
    setColumns,
    initialLoad,
    setInitialLoad,
    showREDCapAPIInput,
    setShowREDCapAPIInput,
    setSelectedFilename,
    setDDData,
    tablesData,
    setTablesData,
    setRedcapFormName,
    extraMappedData,
    setExtraMappedData,
    checklistData,
    initialState,
  } = useDataContext();

  const [ddParseErr, setDDParseErr] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  useEffect(() => {
    // console.log("useeffect store", extraMappedData);
    localStorage.setItem("extraMappedData", JSON.stringify(extraMappedData));
  }, [extraMappedData]);

  const isIdPresentInTablesData = (item) => {
    let id = item.concept_id;
    if (!id) return false;

    return tablesData.some((table, tableIndex) => {
      return table.data.some((row, rowIndex) => {
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
          const extraData = parsedAnnotation[property]?.extraData;
          const conceptId = extraData?.concept_id;
          // console.log('extra', extraData)
          let ogValue = extraData?.og_field_name_key;
          let ogKey = extraData?.og_field_name;
          let fieldName = parsedAnnotation[property]["Field Name"];
          // console.log('fieldname', fieldName)
          if (conceptId === id) {
            // console.log('we match', conceptId)
            //update extraMappedData with mappedData values and stuff
            // if (ogValue) {
            updateOgValueAndKeyInLocalStorage(id, ogValue, ogKey, fieldName);
            // }

            return true;
          } else {
            // console.log('no match on ', conceptId)
          }
        }

        // console.log(`No match found for row ${rowIndex}`);
        return false;
      });
    });
  };

  function updateOgValueAndKeyInLocalStorage(
    conceptId,
    newOgValue,
    newOgKey,
    fieldName
  ) {
    // Retrieve the existing data from local storage

    let storedData = localStorage.getItem("extraMappedData");
    if (storedData) {
      storedData = JSON.parse(storedData);

      // Traverse the 'person' object
      for (const key in storedData.person) {
        if (storedData.person[key].concept_id === conceptId) {
          // console.log("we are updating", conceptId);
          storedData.person[key].ogValue = newOgValue;
          storedData.person[key].ogKey = newOgKey;
          storedData.person[key].fieldName = fieldName;

          // return;
          // continue;
          break; // Exit once the matching concept_id is found
        } else {
          // console.log("we do not match this id", conceptId);
        }
        // return;
      }

      // Traverse the 'observation_period' object if needed
      // (In this case, it seems there's no concept_id in observation_period, so I'm omitting it)

      // setExtraMappedData(storedData)
      // console.log('storedData', storedData)
      localStorage.setItem("extraMappedData", JSON.stringify(storedData));
    }
  }

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
            header: "Field Label",
            accessorKey: "field_annotation",
            Cell: ({ row }) => (
              <LabelCell annotation={row.original.field_annotation} row={row} />
            ),
          },
          {
            header: "Value",
            accessorKey: "field_annotation_value",
            Cell: ({ row }) => (
              <ValueCell annotation={row.original.field_annotation} row={row} />
            ),
          },
          {
            header: "Mapped To",
            Cell: ({ row }) => (
              <MappedCell
                annotation={row.original.field_annotation}
                row={row}
              />
            ),
          },
          {
            header: "Domain",
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
      setColumns([]);
      setRows([]);
      setDDParseErr(true);
    }
  };

  // const handleREDCapAPIButtonClick = () => {
  //   localStorage.setItem("dd_data", "");

  //   setShowREDCapAPIInput(!showREDCapAPIInput);
  //   setInitialLoad(false);
  //   setSelectedFilename("");
  //   setDDData([]);
  // };

  const removeTable = (indexToRemove) => {
    setTablesData((prevData) =>
      prevData.filter((_, index) => index !== indexToRemove)
    );
  };

  function LabelCell({ annotation, row }) {
    // Parse the annotation JSON
    const parsedAnnotation = JSON.parse(annotation);

    // If the annotation is an object, display its items on separate lines
    if (parsedAnnotation && typeof parsedAnnotation === "object") {
      return (
        <div>
          {Object.values(parsedAnnotation).map((item, index) => (
            <React.Fragment key={index}>
              {item["Field Label"]}
              <br />
            </React.Fragment>
          ))}
        </div>
      );
    }

    return <div>{annotation}</div>;
  }

  function ValueCell({ annotation, row }) {
    // Parse the annotation JSON
    const parsedAnnotation = JSON.parse(annotation);

    // If the annotation is an object, display its items on separate lines
    if (parsedAnnotation && typeof parsedAnnotation === "object") {
      return (
        <div>
          {Object.values(parsedAnnotation).map((item, index) => (
            <React.Fragment key={index}>
              {item["extraData"]["og_field_name_key"]}
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

  function importConfig() {
    console.log("import");
  }

  function exportConfig() {
    console.log("export");
  }

  function clearConfig() {
    setExtraMappedData(initialState);
  }
  return (
    // <Container>
    <>
      {checklistData.length && Object.keys(extraMappedData).length > 0 ? (
        <Grid container spacing={3}>
          {/* Checklist Column */}
          <Grid item xs={3}>
            <Tooltip title="Import Config" placement="top">
              <Button
                // disabled={!isValid || isExecuting}
                onClick={importConfig}
                color="success"
                variant="contained"
                sx={{ marginTop: "10px" }}
              >
                <UploadIcon />
              </Button>
            </Tooltip>

            <Tooltip title="Export Config" placement="top">
              <Button
                // disabled={!isValid || isExecuting}
                onClick={exportConfig}
                color="success"
                variant="contained"
                sx={{ marginTop: "10px", marginLeft: "20px" }}
              >
                <DownloadIcon />
              </Button>
            </Tooltip>
            <br />
            <Tooltip title="Clear" placement="top">
              <Button
                // disabled={!isValid || isExecuting}
                onClick={clearConfig}
                color="error"
                variant="contained"
                sx={{ marginTop: "10px" }}
              >
                <RestartAltIcon />
              </Button>
            </Tooltip>

            <Paper elevation={3} sx={{ marginTop: "55px" }}>
              <h3>Person</h3>
              <Divider />
              <List>
                {checklistData[0].person.map((item) => (
                  <ListItem key={item.label}>
                    <ListItemIcon>
                      {isIdPresentInTablesData(item) ||
                      (item.extraFields &&
                        item.extraFields.some(
                          (field) =>
                            field.type === "textfield" &&
                            extraMappedData.person[item.id].textfieldValue &&
                            extraMappedData.person[
                              item.id
                            ].textfieldValue.trim() !== ""
                        )) ? (
                        <CheckIcon
                          style={{ color: theme.palette.success.main }}
                        />
                      ) : (
                        <CloseIcon
                          style={{ color: theme.palette.error.main }}
                        />
                      )}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                    {item.extraFields &&
                      item.extraFields.map((field) => {
                        const uniqueKey = `${item.id}`;
                        if (field.type === "textfield") {
                          return (
                            <TextField
                              label={field.placeholder}
                              key={uniqueKey}
                              placeholder={field.placeholder}
                              variant="outlined"
                              size="small"
                              value={
                                extraMappedData.person[uniqueKey]
                                  .textfieldValue || ""
                              }
                              onChange={(e) =>
                                setExtraMappedData((prev) => ({
                                  ...prev,
                                  person: {
                                    ...prev.person,
                                    [uniqueKey]: {
                                      ...prev.person[uniqueKey],
                                      textfieldValue: e.target.value,
                                    },
                                  },
                                }))
                              }
                            />
                          );
                        }
                        if (field.type === "select") {
                          return (
                            <Select
                              value={
                                extraMappedData.person[uniqueKey].format || ""
                              }
                              onChange={(e) =>
                                setExtraMappedData((prev) => ({
                                  ...prev,
                                  person: {
                                    ...prev.person,
                                    [uniqueKey]: {
                                      ...prev.person[uniqueKey],
                                      format: e.target.value,
                                    },
                                  },
                                }))
                              }
                              variant="outlined"
                              size="small"
                            >
                              {field.options.map((option) => (
                                <MenuItem key={option} value={option}>
                                  {option}
                                </MenuItem>
                              ))}
                            </Select>
                          );
                        }
                        return null; // if field type is unrecognized
                      })}
                  </ListItem>
                ))}
              </List>
            </Paper>

            <Paper elevation={3} sx={{ marginTop: "20px" }}>
              <h3>Observation Period</h3>
              <Divider />
              <List>
                {checklistData[0].observation_period.map((item, index) => (
                  <ListItem key={item.label + "-" + index}>
                    <ListItemIcon>
                      {isIdPresentInTablesData(item.id) ||
                      (item.extraFields &&
                        item.extraFields.some(
                          (field) =>
                            field.type === "textfield" &&
                            extraMappedData.observation_period[item.id]
                              .textfieldValue &&
                            extraMappedData.observation_period[
                              item.id
                            ].textfieldValue.trim() !== ""
                        )) ? (
                        <CheckIcon
                          style={{ color: theme.palette.success.main }}
                        />
                      ) : (
                        <CloseIcon
                          style={{ color: theme.palette.error.main }}
                        />
                      )}
                    </ListItemIcon>

                    <Grid container spacing={2}>
                      {/* Label Grid */}
                      <Grid item xs={12} sm={6} md={4}>
                        <ListItemText primary={item.label} />
                      </Grid>

                      {/* Input Fields Grid */}
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={8}
                        container
                        direction="column"
                      >
                        {item.extraFields &&
                          item.extraFields.map((field) => {
                            const uniqueKey = `${item.id}`;
                            if (field.type === "textfield") {
                              return (
                                <Grid item key={uniqueKey + "-" + field}>
                                  <TextField
                                    label={field.placeholder}
                                    placeholder={field.placeholder}
                                    variant="outlined"
                                    size="small"
                                    fullWidth
                                    value={
                                      extraMappedData.observation_period[
                                        uniqueKey
                                      ].textfieldValue || ""
                                    }
                                    onChange={(e) =>
                                      setExtraMappedData((prev) => ({
                                        ...prev,
                                        observation_period: {
                                          ...prev.observation_period,
                                          [uniqueKey]: {
                                            ...prev.observation_period[
                                              uniqueKey
                                            ],
                                            textfieldValue: e.target.value,
                                          },
                                        },
                                      }))
                                    }
                                  />
                                </Grid>
                              );
                            }

                            if (field.type === "select") {
                              return (
                                <Grid item key={uniqueKey}>
                                  <Select
                                    fullWidth
                                    value={
                                      extraMappedData.observation_period[
                                        uniqueKey
                                      ].format || ""
                                    }
                                    onChange={(e) =>
                                      setExtraMappedData((prev) => ({
                                        ...prev,
                                        observation_period: {
                                          ...prev.observation_period,
                                          [uniqueKey]: {
                                            ...prev.observation_period[
                                              uniqueKey
                                            ],
                                            format: e.target.value,
                                          },
                                        },
                                      }))
                                    }
                                    variant="outlined"
                                    size="small"
                                  >
                                    {field.options.map((option) => (
                                      <MenuItem key={option} value={option}>
                                        {option}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </Grid>
                              );
                            }

                            return null; // if field type is unrecognized
                          })}
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
          <Grid item xs={9}>
            {/* <Button variant="contained" onClick={handleREDCapAPIButtonClick}>
              REDCap API
            </Button> */}
            <Button
              color="success"
              sx={{ margin: "10px" }}
              variant="contained"
              onClick={handleButtonClick}
            >
              Add Mapped File
            </Button>

            {initialLoad ? (
              <></>
            ) : showREDCapAPIInput ? (
              <>
                <Paper elevation={3}>
                  <Divider sx={{}} />
                  <Box
                    sx={{ textAlign: "center", marginTop: 1, marginBottom: 1 }}
                  >
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
            {ddParseErr && (
              <Typography>Error parsing data dictionary</Typography>
            )}
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
      ) : null}
    </>
  );
}

export default FilePicker;
