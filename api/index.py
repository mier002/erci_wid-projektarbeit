from fastapi import FastAPI
import json
from pathlib import Path

### Create FastAPI instance with custom docs and openapi url
app = FastAPI(docs_url="/api/py/docs", openapi_url="/api/py/openapi.json")

JSON_FILE_PATH = Path("/pages/data/meteodaten_2023_daily.json")

@app.get("/api/py/meteodaten")
def get_meteodaten():
    try:
        # JSON-Datei öffnen und laden
        with open(JSON_FILE_PATH, encoding="utf-8") as file:
            data = json.load(file)
        return data
    except FileNotFoundError:
        return {"error": "JSON file not found. Please check the path and filename."}
    except json.JSONDecodeError:
        return {"error": "Invalid JSON format. Please check the file content."}