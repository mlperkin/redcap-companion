import React from 'react';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { useNavigate, useLocation } from "react-router-dom";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine tab index based on current route
  const getTabIndex = (path) => {
    switch(path) {
      case "/": return 0;
      case "/setupConnections": return 1;
      default: return 0;
    }
  };

  const navIdx = getTabIndex(location.pathname);

  const handleChange = (event, newValue) => {
    switch(newValue){
      case 0: navigate("/"); break;
      case 1: navigate("/setupConnections"); break;
      default: break;
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Tabs value={navIdx} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Pick Data Dictionary" sx={{ "&.Mui-selected": { color: "#ffffff" } }}/>
          <Tab label="Setup Connections" sx={{ "&.Mui-selected": { color: "#ffffff" } }}/>
          <Tab label="Execute" sx={{ "&.Mui-selected": { color: "#ffffff" } }}/>
        </Tabs>
      </AppBar>
      <TabPanel value={navIdx} index={0}>
        Pick Data Dictionary
      </TabPanel>
      <TabPanel value={navIdx} index={1}>
        Setup Connections
      </TabPanel>
      <TabPanel value={navIdx} index={2}>
        Execute
      </TabPanel>
    </Box>
  );
}
