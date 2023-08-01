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
        setSelectedFilename
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
