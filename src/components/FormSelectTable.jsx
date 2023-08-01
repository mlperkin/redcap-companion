import React from "react";
import Box from "@mui/material/Box";
import MaterialReactTable from "material-react-table";
import { darken, Button } from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

export default function FormSelectTable({
  columns,
  data,
  setSorting,
  handleExportData,
  selectedRows,
  setSelectedRows,
  tableInstanceRef,
}) {
  return (
    <MaterialReactTable
      columns={columns}
      data={data}
      enableDensityToggle={false}
      memoMode="cells"
      enableBottomToolbar={true}
      enableGlobalFilterModes={true}
      enablePagination={true}
      options={{
        selection: true,
      }}
      enableRowSelection
      tableInstanceRef={tableInstanceRef}

      state={{ selectedRows }} //pass our managed row selection state to the table to use
      getRowId={(row) => row.field_name} //give each row a more useful id
      muiTableBodyRowProps={({ row }) => ({

        onClick: () =>
          setSelectedRows((prev) => ({
            ...prev,
            [row.id]: !prev[row.id],
          })),
        selected: selectedRows[row.id],
        sx: {
          cursor: "pointer",
        },
      })}
      muiTableContainerProps={{
        sx: { maxHeight: "50vh" },
      }}
      onSortingChange={setSorting}
      initialState={{
        density: "compact",
      }}
      enableColumnResizing={true}
      enableSorting={true}
      enableStickyHeader
      muiSelectCheckboxProps={{
        color: "secondary",
        // defaultChecked: true, // Select all rows by default
      }}
      muiTablePaperProps={{
        elevation: 2,
        sx: {
          borderRadius: "0",
          border: "1px solid #e0e0e0",
        },
      }}
      muiTableBodyProps={{
        sx: (theme) => ({
          "& tr:nth-of-type(odd)": {
            backgroundColor: darken(theme.palette.background.default, 0.1),
          },
        }),
      }}
      muiTableHeadProps={{
        sx: (theme) => ({
          "& tr": {
            backgroundColor: "#343541",
            color: "#ffffff",
          },
        }),
      }}
      muiTableHeadCellProps={{
        sx: (theme) => ({
          div: {
            backgroundColor: "#343541",
            color: "#ffffff",
          },
        }),
      }}
      positionToolbarAlertBanner="bottom"
      renderTopToolbarCustomActions={({ table }) => (
        <Box
          width="100%"
          sx={{
            display: "flex",
            gap: "1rem",
            p: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <Button
            color="success"
            onClick={handleExportData}
            startIcon={<FileDownloadIcon />}
            variant="outlined"
          >
            Export
          </Button>
        </Box>
      )}
    />
  );
}
