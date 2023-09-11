import React, {
  useState,
  useContext,
  useEffect,
  useMemo,
  createContext,
} from "react";
import { Routes, Route } from "react-router-dom";
import MappedDataPage from "./pages/MappedDataPage";
import ConnectionsSetupPage from "./pages/ConnectionsSetupPage";
import OutputPage from "./pages/OutputPage";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import NavBar from "./components/NavBar";
import { DataProvider } from "./components/context/DataContext";

const ColorModeContext = createContext({ toggleColorMode: () => {} });

function App({ mode }) {
  const colorMode = useContext(ColorModeContext);

  return (
    <DataProvider>
      <NavBar toggleColorMode={colorMode.toggleColorMode} />
      <Routes>
        {/* set init page */}
        <Route path="/" element={<ConnectionsSetupPage mode={mode} />} />
        <Route
          path="/mappedData"
          element={<MappedDataPage mode={mode} />}
        />
        <Route
          path="/setupConnections"
          element={<ConnectionsSetupPage mode={mode} />}
        />
        <Route path="/output" element={<OutputPage mode={mode} />} />
      </Routes>
    </DataProvider>
  );
}

export default function ToggleColorMode() {
  const storedColorPref = localStorage.getItem("colorPref");
  const initialMode = storedColorPref ? JSON.parse(storedColorPref) : "light";
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    localStorage.setItem("colorPref", JSON.stringify(mode));
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
    }),
    []
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  return (
    <>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App mode={mode} />
        </ThemeProvider>
      </ColorModeContext.Provider>
    </>
  );
}
