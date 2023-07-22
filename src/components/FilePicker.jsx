import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { DataGrid } from '@mui/x-data-grid';
const { ipcRenderer } = window.require('electron');

function FilePicker() {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);

  const handleButtonClick = async () => {
    const data = await ipcRenderer.invoke('open-file-dialog');
    if (data && data.length > 0) {
      setColumns(
        Object.keys(data[0]).map((key) => ({ field: key, width: 150 }))
      );
      setRows(
        data.map((item, index) => ({
          id: index,
          ...item,
        }))
      );
    }
  };

  return (
    <div style={{ height: 400, width: '100%' }}>
      <Button onClick={handleButtonClick}>Pick File</Button>
      <DataGrid rows={rows} columns={columns} pageSize={5} />
    </div>
  );
}

export default FilePicker;
