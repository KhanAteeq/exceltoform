import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./App.css";

function App() {
  const [fields, setFields] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      setFields(sheet);
    };
    reader.readAsArrayBuffer(file);
  };

  const renderField = (field) => {
    switch (field.FieldType.toLowerCase()) {
      case "inputbox":
        return <input className="form-input" type={field.Datatype === "number" ? "number" : "text"} required={field.Required === "Yes"} />;
      case "dropdown":
        return (
          <select className="form-select" required={field.Required === "Yes"}>
            {field.Options.split(",").map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case "checkbox":
        return <input className="form-checkbox" type="checkbox" />;
      case "radio":
        return field.Options.split(",").map((option) => (
          <label key={option} className="form-radio-label">
            <input className="form-radio" type="radio" name={field.ColumnName} value={option} required={field.Required === "Yes"} /> {option}
          </label>
        ));
      case "textarea":
        return <textarea className="form-textarea" required={field.Required === "Yes"} />;
      case "button":
        return <button className="form-button" type="submit">{field.ColumnName}</button>;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h2 className="title">Upload Excel File</h2>
        
        {/* ✅ Added "htmlFor" to link label to input */}
        <label htmlFor="file-upload">Upload Excel File</label>
        <input
          id="file-upload"
          className="file-input"
          type="file"
          accept=".xlsx, .xls"
          data-testid="file-input" // ✅ Added test ID for testing
          onChange={handleFileUpload}
        />

        {fields.length > 0 && (
          <form className="form-container">
            {fields.map((field, index) => (
              <div key={index} className="form-group">
                <label className="form-label">{field.ColumnName}</label>
                {renderField(field)}
              </div>
            ))}
          </form>
        )}
      </header>
    </div>
  );
}

export default App;
