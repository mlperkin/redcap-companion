import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { useNavigate, useLocation } from "react-router-dom";
import CloseIcon from "../images/icons/close-w-10.png";
import MaximizeIcon from "../images/icons/max-w-10.png";
import MinimizeIcon from "../images/icons/min-w-10.png";
import RestoreIcon from "../images/icons/restore-w-10.png";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useDataContext } from "./context/DataContext";
const { ipcRenderer } = window.require("electron");

export default function NavBar(props) {
  const [isMaximized, setIsMaximized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    isExecuting
  } = useDataContext();

  const { toggleColorMode } = props;
  const theme = useTheme();

  // Listen for the "window-maximized" message from the main process
  useEffect(() => {
    const handleMaximizedChange = (event, maximized) => {
      setIsMaximized(maximized);
    };
    ipcRenderer.on("window-maximized", handleMaximizedChange);

    // Cleanup the event listener when the component unmounts
    return () => {
      ipcRenderer.removeListener("window-maximized", handleMaximizedChange);
    };
  }, []);

  // Determine tab index based on current route
  const getTabIndex = (path) => {
    switch (path) {
      case "/setupConnections":
        return 0;
      case "/mappingData":
        return 1;
      case "/output":
        return 2;
      default:
        return 0;
    }
  };

  const navIdx = getTabIndex(location.pathname);

  const handleChange = (event, newValue) => {
    switch (newValue) {
      case 0:
        navigate("/setupConnections");
        break;
      case 1:
        navigate("/mappingData");
        break;
      case 2:
        navigate("/output");
        break;
      default:
        break;
    }
  };

  const checkMaximized = () => {
    // Fetch the initial window maximized state when the component mounts
    ipcRenderer.invoke("is-window-maximized").then((result) => {
      setIsMaximized(result);
    });
  };

  const handleMinimize = () => {
    ipcRenderer.invoke("window-minimize"); // Send message to the main process to minimize the window
  };

  const handleMaximize = () => {
    ipcRenderer.invoke("window-maximize"); // Send message to the main process to maximize the window
    checkMaximized();
  };

  const handleClose = () => {
    ipcRenderer.invoke("window-close"); // Send message to the main process to close the window
  };

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
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  }

  return (
    <Box className="navBarBox" sx={{ flexGrow: 1 }}>
      <AppBar
        className="navBar"
        position="fixed"
        sx={{ height: "56px", WebkitAppRegion: "drag" }} // Make the entire app bar draggable
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton
            className={"my-sixth-step"}
            sx={{ ml: 1, fontSize: "14px" }} // Adjust the font size as needed
            onClick={toggleColorMode}
          >
            {theme.palette.mode === "dark" ? (
              <LightModeIcon />
            ) : (
              <DarkModeIcon />
            )}
          </IconButton>
          {/* Tabs */}
          <Tabs
            value={navIdx}
            onChange={handleChange}
            textColor="inherit"
            indicatorColor="secondary"
            aria-label="simple tabs example"
          >
            <Tab label="Connections Setup" disabled={isExecuting} />
            <Tab label="Mapping Data" disabled={isExecuting} />
            <Tab label="Output to OMOP" />
          </Tabs>

          {/* Window controls */}
          <div style={{ display: "flex" }}>
            <div
              className="button miniButton"
              onClick={handleMinimize}
              style={{ WebkitAppRegion: "no-drag", padding: "15px" }}
            >
              <img src={MinimizeIcon} alt="Minimize" />
            </div>
            <div
              className="button maxRestoreButton"
              onClick={handleMaximize}
              style={{ WebkitAppRegion: "no-drag", padding: "15px" }}
            >
              {isMaximized ? (
                <img src={RestoreIcon} alt="Restore" />
              ) : (
                <img src={MaximizeIcon} alt="Maximize" />
              )}
            </div>
            <div
              className="button closeButton"
              onClick={handleClose}
              style={{ WebkitAppRegion: "no-drag", padding: "15px" }}
            >
              <img src={CloseIcon} alt="Close" />
            </div>
          </div>
        </div>
      </AppBar>

      <TabPanel value={navIdx} index={0}></TabPanel>
      <TabPanel value={navIdx} index={1}></TabPanel>
      <TabPanel value={navIdx} index={2}></TabPanel>
    </Box>
  );
}
