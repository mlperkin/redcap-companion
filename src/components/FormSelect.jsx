/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo, useRef } from "react";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import FormSelectTable from "./FormSelectTable";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import Skeleton from "@mui/material/Skeleton";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import { encryptData, decryptData } from "../utils/encryption";
import { useDataContext } from "./context/DataContext";

const { ipcRenderer } = window.require("electron");

var XLSX = require("xlsx");
export default function FormSelect({ props }) {
  const { ddData, setDDData, redcapFormName, setRedcapFormName } =
    useDataContext();

  const [selectedForm, setSelectedForm] = useState("");
  const [data, setData] = useState();
  const [colDefs, setColDefs] = useState([]);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [csvFilename, setCSVFilename] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);
  const [formData, setFormData] = useState();
  const [formDataLoaded, setFormDataLoaded] = useState();
  const [noMappedResults, setNoMappedResults] = useState();

  var tableInstanceRef = useRef(null);

  useEffect(() => {
    //check if api was already selected
    if (localStorage.getItem("redcapAPIDD")) {
      // console.log('just set it', ddData)
      if (ddData && ddData.length > 0) {
        const workSheet = XLSX.utils.json_to_sheet(ddData);
        //convert to array
        const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
        const headers = fileData[0];

        const heads = headers.map((head) => ({
          accessorKey: head.replaceAll(".", ""),
          header: head.replaceAll(".", ""),
        }));
        setColDefs(heads);
        setData(ddData);
        setIsFormLoaded(true);
        setIsFormLoading(false);
        setSelectedForm(redcapFormName);
      } else {
        setIsFormLoaded(false);
      }
    }

    setFormDataLoaded(false);

    // Request the store data from the main process when the component mounts
    ipcRenderer.invoke("getStoreData").then((data) => {
      const decryptedData = decryptData(data.redcapFormData); // Decrypt the data
      if (decryptedData) {
        setFormData(decryptedData);
      }
      setFormDataLoaded(true);
    });
  }, [ddData]);

  useEffect(() => {
    if (tableInstanceRef.current) {
      setSelectedRows(tableInstanceRef.current.getState().rowSelection);
    }
  }, [tableInstanceRef.current]);

  const handleRowSelection = (selected) => {
    const rowSelection = tableInstanceRef.current.getState().rowSelection;
    setSelectedRows(rowSelection);
  };

  const columns = useMemo(() => colDefs, [colDefs]);

  function getDataDictionary(event) {
    setIsFormLoaded(false);
    setIsFormLoading(true);
    if (!selectedForm) setSelectedForm(props.forms[0]);
    // console.log("selected form", selectedForm);
    var formdata = new FormData();
    // console.log("formdata", formData);
    formdata.append("token", formData.redcapAPIKey);
    formdata.append("content", "metadata");
    formdata.append("format", "json");
    formdata.append("forms[0]", selectedForm);

    var requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    fetch(formData.redcapAPIURL, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        parseResult(JSON.parse(result));
        localStorage.setItem("redcapAPIDD", true);
      })
      .catch((error) => console.log("error", error));
  }

  useEffect(() => {
    if (!selectedForm) {
      console.log("set selected form");
      if (redcapFormName) setSelectedForm(redcapFormName);
      else setSelectedForm(props.forms[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.forms]);
  const handleChange = (event) => {
    console.log("handle change");
    setSelectedForm(event.target.value);
    resetScreen();
  };

  function parseResult(e) {
    const file = e;
    // setCSVFilename(file.name);

    const workSheet = XLSX.utils.json_to_sheet(file);
    //convert to array
    const fileData = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
    const headers = fileData[0];

    const heads = headers.map((head) => ({
      accessorKey: head.replaceAll(".", ""),
      header: head.replaceAll(".", ""),
    }));
    setColDefs(heads);
    //removing header
    fileData.splice(0, 1);
    setSelectedRows(convertToJson(headers, fileData));

    let convertedData = convertToJson(headers, fileData);
    for (var i = 0; i < convertedData.length; i++) {
      var obj = convertedData[i];

      // Check if the field_type is 'dropdown'
      if (obj.field_type === "dropdown" || obj.field_type === "radio") {
        var selectChoices = obj.select_choices_or_calculations;

        var choices = selectChoices.split("|"); // Split the string into individual choices

        var parsedChoices = choices.map(function (choice) {
          var keyValue = choice.split(",");
          var key = keyValue[0].trim();
          var value = keyValue[1].trim();
          return { key: key, value: value };
        });

        console.log("Parsed choices: ", parsedChoices);

        // Append new objects with parsed data to convertedData array
        for (var j = 0; j < parsedChoices.length; j++) {
          var choice = parsedChoices[j];
          var appendedFieldName = obj.field_name + "_" + choice.key;

          var newObject = {
            field_name: appendedFieldName,
            form_name: obj.form_name,
            section_header: obj.section_header,
            field_type: obj.field_type,
            field_label: choice.value,
            select_choices_or_calculations: obj.select_choices_or_calculations,
            field_note: obj.field_note,
            text_validation_type_or_show_slider_number:
              obj.text_validation_type_or_show_slider_number,
            text_validation_min: obj.text_validation_min,
            text_validation_max: obj.text_validation_max,
            identifier: obj.identifier,
            branching_logic: obj.branching_logic,
            required_field: obj.required_field,
            custom_alignment: obj.custom_alignment,
            question_number: obj.question_number,
            matrix_group_name: obj.matrix_group_name,
            matrix_ranking: obj.matrix_ranking,
            field_annotation: obj.field_annotation,
          };

          convertedData.splice(i + 1, 0, newObject); // Insert new object after the current object
          i++; // Increment i to skip the newly inserted object in the next iteration
        }
      }
    }
    console.log("converted", convertedData);

    let _formName;
    let onlyMappedData = convertedData.filter((item) => {
      try {
        // Attempt to parse the field_annotation as JSON
        const parsedValue = JSON.parse(item.field_annotation);
        if (item.form_name) _formName = item.form_name;
        return typeof parsedValue === "object" && parsedValue !== null; // Check if the parsed value is an object
      } catch (e) {
        return false; // If parsing failed, exclude this item from the filtered result
      }
    });

    setData(onlyMappedData);
    // localStorage.setItem('dd_data', JSON.stringify(convertedData))
    setDDData(onlyMappedData);
    if (onlyMappedData && onlyMappedData.length <= 0) {
      setNoMappedResults(true);
    } else {
      setNoMappedResults(false);
    }
    // if(!_formName) throw new Error('No form name detected')
    setRedcapFormName(_formName);
    setIsFormLoaded(true);
    setIsFormLoading(false);
  }

  const convertToJson = (headers, data, approved) => {
    const rows = [];
    let approvedIdx = headers.indexOf("Approved");
    data.forEach((row) => {
      let rowData = {};
      row.forEach((element, index) => {
        if (approved) {
          if (row[approvedIdx] === "Y") {
            rowData[headers[index]] = element;
          }
        } else {
          rowData[headers[index]] = element;
        }
      });
      if (Object.keys(rowData).length !== 0) {
        rows.push(rowData);
      }
    });
    return rows;
  };

  const handleExportData = () => {
    let _data = data;
    let keys = _data.reduce(function (acc, obj) {
      Object.keys(obj).forEach(function (key) {
        if (!acc.includes(key)) acc.push(key);
      });
      return acc;
    }, []);

    _data.forEach(function (obj) {
      keys.forEach(function (key) {
        if (!obj[key]) obj[key] = "";
      });
    });
    // Convert the results array to CSV format using papaparse
    const csvData = Papa.unparse(_data);

    // Create a Blob from the CSV data
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });

    // Use FileSaver to save the generated CSV file
    saveAs(blob, `${csvFilename}.csv`);
  };

  function resetScreen() {
    setData("");
    setCSVFilename("");
    setIsFormLoaded(false);
  }

  if (props.forms.length > 0) {
    return (
      <>
        <Grid container>
          <Grid item lg={12} xl={4}>
            <FormControl>
              <InputLabel id="select-form-label">REDCap Forms</InputLabel>
              <Select
                labelId="select-form-label"
                label="REDCap Forms"
                id="select-form"
                value={selectedForm || (props.forms && props.forms[0])} // add a null check before accessing the array
                onChange={handleChange}
              >
                {props.forms.map((form) => (
                  <MenuItem key={form} value={form}>
                    {form}
                  </MenuItem>
                ))}
              </Select>
              <Grid sx={{ mt: 1, mb: 1 }}>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<ImportExportIcon />}
                  onClick={(e) => getDataDictionary(e)}
                >
                  Get Data
                </Button>
              </Grid>
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            lg={12}
            sx={{ maxWidth: "100%", overflowX: "auto" }}
          >
            {isFormLoading && (
              <Skeleton variant="rounded" width={"100%"} height={"40vh"} />
            )}
            {!isFormLoading && noMappedResults && (
              <Typography>No mapped results detected</Typography>
            )}
            {isFormLoaded && (
              <>
                <FormSelectTable
                  props={props}
                  columns={columns}
                  data={data}
                  handleExportData={handleExportData}
                  resetScreen={resetScreen}
                  handleRowSelection={handleRowSelection}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                  tableInstanceRef={tableInstanceRef}
                />
              </>
            )}
          </Grid>
        </Grid>
      </>
    );
  }
}
