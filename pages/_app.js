import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function App() {
  const [locations, setLocations] = useState({});
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    // CSV-Datei manuell laden und verarbeiten
    const fetchData = async () => {
      try {
        const response = await fetch("/meteodaten_2023_daily.csv");
        const csvText = await response.text();

        // CSV parsen
        const lines = csvText.split("\n");
        const headers = lines[0].split(","); // Erste Zeile als Header verwenden
        const data = lines.slice(1).map((line) => {
          const values = line.split(",");
          return headers.reduce((acc, header, index) => {
            acc[header.trim()] = values[index]?.trim();
            return acc;
          }, {});
        });

        // Daten nach Standort gruppieren
        const groupedData = data.reduce((acc, item) => {
          const location = item["Standort"]; // Ersetze "Standort" mit dem tatsächlichen Feldnamen
          if (!acc[location]) {
            acc[location] = [];
          }
          acc[location].push(item);
          return acc;
        }, {});

        setLocations(groupedData);
      } catch (error) {
        console.error("Fehler beim Laden der CSV-Datei:", error);
      }
    };

    fetchData();
  }, []);

  const handleShowData = () => {
    // Daten für Zch_Rosengartenstrasse anzeigen
    const data = locations["Zch_Rosengartenstrasse"];
    setSelectedData(data || []);
  };

  return (
    <Box sx={{ p: 4 }}>
      <h1>Standortdaten</h1>
      <Button
        variant="contained"
        color="primary"
        onClick={handleShowData}
        sx={{ mb: 2 }}
      >
        Daten für Zch_Rosengartenstrasse anzeigen
      </Button>

      {selectedData && (
        <Box>
          <h2>Daten für Zch_Rosengartenstrasse:</h2>
          <pre>{JSON.stringify(selectedData, null, 2)}</pre>
        </Box>
      )}
    </Box>
  );
}
