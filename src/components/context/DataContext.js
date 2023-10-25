// DataContext.js
import { createContext, useContext, useState } from "react";

const DataContext = createContext();

export const useDataContext = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showREDCapAPIInput, setShowREDCapAPIInput] = useState(false);
  const [selectedFilename, setSelectedFilename] = useState("");
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [isRedcapConnected, setIsRedcapConnected] = useState(null); // Use null initially for an undetermined state
  const [isExecuting, setIsExecuting] = useState(null); // Use null initially for an undetermined state
  const [execStatus, setExecStatus] = useState(null); //null initially for undetermined state
  const [ddData, setDDData] = useState([]);
  const [tablesData, setTablesData] = useState([]);
  const [redcapFormName, setRedcapFormName] = useState();
  const [selectedOMOPTables, setSelectedOMOPTables] = useState([]);
  const [checkboxFieldData, setCheckboxFieldData] = useState({
    person: {
      idTextValue: "",
      birthdateTextValue: "",
      raceTextValue: "",
      maleGenderTextValue: "",
      femaleGenderTextValue: "",
      //... other fields ...
    },
    observation_period: {
      earliestObservationDateTextValue: "",
      latestObservationDateTextValue: "",
    },
  });

  const dateFormatOptions = [
    "YYYY-MM-DD",
    "YYYY/MM/DD",
    "DD-MM-YYYY",
    "DD/MM/YYYY",
    "MM-DD-YYYY",
    "MM/DD/YYYY",
    "YYYY.MM.DD",
    "DD.MM.YYYY",
    "MM.DD.YYYY",
  ];

  const checklistData = [
    {
      person: [
        {
          id: "person_id",
          label: "Person ID",
          extraFields: [
            {
              id: "personIDKey",
              type: "textfield",
              placeholder: "Specify ID",
            },
          ],
        },
        {
          id: "birth_year",
          concept_id: 4083587,
          label: "Birth Year",
          extraFields: [
            {
              id: "birthYearFormat",
              type: "select",
              placeholder: "Specify date format",
              options: dateFormatOptions,
            },
          ],
        },
        { id: "male", concept_id: 8507, label: "Male" },
        { id: "female", concept_id: 8532, label: "Female" },
        {
          id: "hispanic_or_latino",
          concept_id: 38003563,
          label: "Hispanic or Latino",
        },
        {
          id: "not_hispanic_or_latino",
          concept_id: 38003564,
          label: "Not Hispanic",
        },
      ],
      observation_period: [
        {
          id: "start_date",
          concept_id: null,
          label: "Start Date",
          extraFields: [
            {
              id: "obsStartDateID",
              type: "textfield",
              placeholder: "Specify ID",
            },
            {
              id: "obsStartDateFormat",
              type: "select",
              label: "Specify date format",
              options: dateFormatOptions,
            },
          ],
        },
        {
          id: "end_date",
          concept_id: null,
          label: "End Date",
          extraFields: [
            {
              id: "obsEndDateID",
              type: "textfield",
              placeholder: "Specify ID",
            },
            {
              id: "obsEndDateFormat",
              type: "select",
              label: "Specify date format",
              options: dateFormatOptions,
            },
          ],
        },
      ],
    },
  ];

  const constructInitialState = () => {
    const baseStructure = {
      person: {},
      observation_period: {},
    };

    checklistData[0].person.forEach((entry) => {
      baseStructure.person[
        entry.label
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "")
      ] = {
        concept_id: entry.concept_id,
        textfieldValue: "",
        format: null,
        ogValue: null,
        ogKey: null,
      };
    });

    checklistData[0].observation_period.forEach((entry) => {
      baseStructure.observation_period[
        entry.label
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_]/g, "")
      ] = {
        textfieldValue: "",
        format: null,
        ogValue: null,
        ogKey: null,
      };
    });

    return {
      baseStructure,
    };
  };

  const initialState = constructInitialState().baseStructure;

  const [extraMappedData, setExtraMappedData] = useState(() => {
    const storedData = localStorage.getItem("extraMappedData");
    return storedData ? JSON.parse(storedData) : initialState;
  });
  return (
    <DataContext.Provider
      value={{
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
        selectedDatabase,
        setSelectedDatabase,
        isRedcapConnected,
        setIsRedcapConnected,
        isExecuting,
        setIsExecuting,
        execStatus,
        setExecStatus,
        ddData,
        setDDData,
        redcapFormName,
        setRedcapFormName,
        selectedOMOPTables,
        setSelectedOMOPTables,
        checkboxFieldData,
        setCheckboxFieldData,
        tablesData,
        setTablesData,
        extraMappedData,
        setExtraMappedData,
        checklistData,
        initialState
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
