import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import { VegaLite } from "react-vega";
import axios from "axios";

export default function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/py/meteodaten");
        setData(response.data); // Gesamten Datensatz speichern
      } catch (error) {
        console.error("Fehler beim Laden der JSON-Daten:", error);
      }
    };

    fetchData();
  }, []);

  const handleLocationChange = (event) => {
    const location = event.target.value;
    setSelectedLocation(location);
  };

  const handleOptionChange = (event) => {
    const option = event.target.value;
    setSelectedOption(option);
  };

  const handleShowChart = () => {
    if (selectedLocation && selectedOption) {
      const locationData = data.filter((item) => item.Standort === selectedLocation);
      const mappedData = locationData.map((item) => ({
        date: new Date(item.Datum).toISOString().split("T")[0], // Formatierte X-Achse
        value: item[selectedOption], // Dynamisch Regendaten oder Temperatur auswählen
      }));
      setFilteredData(mappedData);
      setShowChart(true); // Diagramm anzeigen
    } else {
      setShowChart(false); // Diagramm nicht anzeigen, falls unvollständige Auswahl
    }
  };

  const handleReset = () => {
    setSelectedLocation(""); // Standortauswahl zurücksetzen
    setSelectedOption(""); // Optionsauswahl zurücksetzen
    setFilteredData([]); // Gefilterte Daten löschen
    setShowChart(false); // Diagramm ausblenden
  };

  const chartSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Gefilterte Daten im Diagramm",
    data: { values: filteredData },
    mark: "line",
    encoding: {
      x: { field: "date", type: "temporal", title: "Datum" }, // X-Achse: Datum
      y: { field: "value", type: "quantitative", title: selectedOption === "T" ? "Temperatur (°C)" : "Regendauer (min)" }, // Y-Achse: Dynamisch
    },
  };

  return (
    <Box sx={{ p: 4 }}>
      <h1>Gefilterte Daten nach Standort und Option</h1>

      {/* Selector für Standort */}
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="location-select-label">Standort auswählen</InputLabel>
        <Select
          labelId="location-select-label"
          id="location-select"
          value={selectedLocation}
          label="Standort auswählen"
          onChange={handleLocationChange}
        >
          <MenuItem value={"Zch_Rosengartenstrasse"}>Rosengartenstrasse</MenuItem>
          <MenuItem value={"Zch_Schimmelstrasse"}>Schimmelstrasse</MenuItem>
          <MenuItem value={"Zch_Stampfenbachstrasse"}>Stampfenbachstrasse</MenuItem>
        </Select>
      </FormControl>

      {/* Selector für Option */}
      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="option-select-label">Option auswählen</InputLabel>
        <Select
          labelId="option-select-label"
          id="option-select"
          value={selectedOption}
          label="Option auswählen"
          onChange={handleOptionChange}
        >
          <MenuItem value={"T"}>Temperatur</MenuItem>
          <MenuItem value={"RainDur"}>Regendauer</MenuItem>
        </Select>
      </FormControl>

      {/* Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Button variant="contained" onClick={handleShowChart}>
          Diagramm anzeigen
        </Button>
        <Button variant="contained" onClick={handleReset} color="secondary">
          Zurücksetzen
        </Button>
      </Box>

      {/* Diagramm anzeigen */}
      {showChart && filteredData.length > 0 && <VegaLite spec={chartSpec} />}
    </Box>
  );
}
