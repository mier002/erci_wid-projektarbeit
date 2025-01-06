import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { VegaLite } from "react-vega";
import axios from "axios";

export default function App() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [showChart, setShowChart] = useState(false);

  const locations = ["Rosengartenstrasse", "Stampfenbachstrasse", "Schimmelstrasse"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("/api/py/meteodaten");
        const rawData = response.data;

        // UNIX-Timestamps in lesbare Datumswerte umwandeln
        const formattedData = rawData.map((item) => ({
          ...item,
          Datum: new Date(item.Datum).toISOString().split("T")[0], // Umwandlung
        }));

        setData(formattedData);
      } catch (error) {
        console.error("Fehler beim Laden der JSON-Datei:", error);
      }
    };

    fetchData();
  }, []);

  const handleLocationChange = (event) => {
    setSelectedLocation(event.target.value);
  };

  const handleOptionChange = (event) => {
    setSelectedOption(event.target.value);
  };

  const handleShowChart = () => {
    if (selectedLocation && selectedOption) {
      const filtered = data
        .filter((item) => item.Standort === `Zch_${selectedLocation}`)
        .map((item) => ({
          date: item.Datum, // Bereits umgewandeltes Datum nutzen
          value: item[selectedOption],
          street: selectedLocation,
        }));

      setFilteredData(filtered);
      setShowChart(true);
    }
  };

  const handleReset = () => {
    setSelectedLocation("");
    setSelectedOption("");
    setFilteredData([]);
    setShowChart(false);
  };

  const chartSpec = {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    description: "Datenvisualisierung",
    data: { values: filteredData },
    mark: "line",
    encoding: {
      x: { field: "date", type: "temporal", title: "Datum" },
      y: { field: "value", type: "quantitative", title: selectedOption },
      color: { field: "street", type: "nominal", title: "Standort" },
    },
  };

  return (
    <Box sx={{ p: 4 }}>
      <h1>Auswahl und Visualisierung</h1>

      {/* Standortauswahl */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="location-label">Standort auswählen</InputLabel>
        <Select
          labelId="location-label"
          id="location-select"
          value={selectedLocation}
          label="Standort auswählen"
          onChange={handleLocationChange}
        >
          {locations.map((location, index) => (
            <MenuItem key={index} value={location}>
              {location}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Optionsauswahl */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="option-label">Option auswählen</InputLabel>
        <Select
          labelId="option-label"
          id="option-select"
          value={selectedOption}
          label="Option auswählen"
          onChange={handleOptionChange}
        >
          <MenuItem value="T">Temperatur</MenuItem>
          <MenuItem value="RainDur">Niederschlag</MenuItem>
        </Select>
      </FormControl>

      {/* Buttons */}
      <Button
        variant="contained"
        onClick={handleShowChart}
        sx={{ mt: 2, mr: 2 }}
        disabled={!selectedLocation || !selectedOption}
      >
        Diagramm anzeigen
      </Button>
      <Button variant="contained" color="secondary" onClick={handleReset}>
        Zurücksetzen
      </Button>

      {/* Diagramm anzeigen */}
      {showChart && filteredData.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <h2>Diagramm</h2>
          <VegaLite spec={chartSpec} />
        </Box>
      )}
    </Box>
  );
}
