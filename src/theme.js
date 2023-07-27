// theme.js
import { createTheme } from '@mui/material/styles';
// color: "#2f3241",
//       symbolColor: "#74b1be",
const theme = createTheme({
  palette: {
    primary: {
      main: '#2f3241', // Change the primary color here
    },
    secondary: {
      main: '#74b1be', // Change the secondary color here
    },
    // You can add more custom colors if needed
    // For example:
    // customColor: '#ff9800',
    // customColor2: '#4caf50',
  },
  // Add more custom styling options if required
  typography: {
    fontFamily: 'Arial, sans-serif', 
    fontColor: '#fff'// Change the default font family here
  },
});

export default theme;
