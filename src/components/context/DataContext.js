// DataContext.js
import { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useDataContext = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [initialLoad, setInitialLoad] = useState(true);
  const [showREDCapAPIInput, setShowREDCapAPIInput] = useState(false);
  const [selectedFilename, setSelectedFilename] = useState('');
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [isRedcapConnected, setIsRedcapConnected] = useState(null); // Use null initially for an undetermined state
  const [isExecuting, setIsExecuting] = useState(null); // Use null initially for an undetermined state
  const [execStatus, setExecStatus] = useState(null); //null initially for undetermined state
  const [ddData, setDDData] = useState([]);
  const [redcapFormName, setRedcapFormName] = useState();

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
        setRedcapFormName
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
