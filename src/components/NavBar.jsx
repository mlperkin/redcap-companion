import React, { useState, useEffect } from "react";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { useNavigate, useLocation } from "react-router-dom";
import CloseIcon from "../icons/close-w-10.png";
import MaximizeIcon from "../icons/max-w-10.png";
import MinimizeIcon from "../icons/min-w-10.png";
import RestoreIcon from "../icons/restore-w-10.png";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

const { ipcRenderer } = window.require("electron");

export default function NavBar(props) {
  const [isMaximized, setIsMaximized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
      case "/selectDataDict":
        return 1;
      case "/execute":
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
        navigate("/selectDataDict");
        break;
      case 2:
        navigate("/execute");
        break;
      default:
        break;
    }
  };

  const checkMaximized = () => {
    // Fetch the initial window maximized state when the component mounts
    ipcRenderer.invoke("is-window-maximized").then((result) => {
      setIsMaximized(result);
      console.log("result max", result);
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
    <Box sx={{ flexGrow: 1 }}>
      <AppBar
        className="navBar"
        position="fixed"
        sx={{ height: "56px", WebkitAppRegion: "drag" }} // Make the entire app bar draggable
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton
            className={"my-sixth-step"}
            sx={{ ml: 1 }}
            onClick={toggleColorMode}
            color="inherit"
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
            indicatorColor="secondary"
            aria-label="simple tabs example"
          >
            <Tab
              label="Connections Setup"
              sx={{
                color: "#ffffff", // Default color for inactive tabs
                "&.Mui-selected": {
                  color: "#74b1be", // Color for selected tab
                },
              }}
            />

            <Tab
              label="Select Data Dictionary"
              sx={{
                color: "#ffffff", // Default color for inactive tabs
                "&.Mui-selected": {
                  color: "#74b1be", // Color for selected tab
                },
              }}
            />

            <Tab
              label="Execute"
              sx={{
                color: "#ffffff", // Default color for inactive tabs
                "&.Mui-selected": {
                  color: "#74b1be", // Color for selected tab
                },
              }}
            />
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
