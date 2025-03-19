import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom"; // ✅ Import jest-dom
import App from "./App";
import * as XLSX from "xlsx";

// Mock XLSX library
jest.mock("xlsx", () => ({
  read: jest.fn(),
  utils: {
    sheet_to_json: jest.fn(),
  },
}));

describe("App Component", () => {
  test("renders the title and file input", () => {
    render(<App />);
  
    // ✅ Select title using heading role (avoids multiple matches)
    const titleElement = screen.getByRole("heading", { name: /upload excel file/i });
    expect(titleElement).toBeInTheDocument();
  
    // ✅ Find file input using label (prevents ambiguity)
    const fileInput = screen.getByLabelText(/upload excel file/i);
    expect(fileInput).toBeInTheDocument();
  
    // ✅ Backup: Select input by test ID
    expect(screen.getByTestId("file-input")).toBeInTheDocument();
  });
  test("uploads and processes an Excel file", async () => {
    render(<App />);

    // Mock file
    const file = new File([""], "test.xlsx", { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const data = [{ ColumnName: "Name", FieldType: "inputbox", Datatype: "text", Required: "Yes" }];

    // Mock XLSX processing
    XLSX.read.mockReturnValue({ SheetNames: ["Sheet1"], Sheets: { Sheet1: {} } });
    XLSX.utils.sheet_to_json.mockReturnValue(data);

    // Find the file input using getByTestId
    const fileInput = screen.getByTestId("file-input");
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for form to render
    await waitFor(() => expect(screen.getByText("Name")).toBeInTheDocument());
  });

  test("renders form fields based on uploaded data", async () => {
    render(<App />);

    const mockData = [
      { ColumnName: "Name", FieldType: "inputbox", Datatype: "text", Required: "Yes" },
      { ColumnName: "Age", FieldType: "inputbox", Datatype: "number", Required: "No" },
      { ColumnName: "Gender", FieldType: "dropdown", Options: "Male,Female,Other", Required: "Yes" },
    ];

    XLSX.read.mockReturnValue({ SheetNames: ["Sheet1"], Sheets: { Sheet1: {} } });
    XLSX.utils.sheet_to_json.mockReturnValue(mockData);

    const fileInput = screen.getByTestId("file-input");
    fireEvent.change(fileInput, { target: { files: [new File([""], "test.xlsx")] } });

    await waitFor(() => {
      expect(screen.getByText("Name")).toBeInTheDocument();
      expect(screen.getByText("Age")).toBeInTheDocument();
      expect(screen.getByText("Male")).toBeInTheDocument();
      expect(screen.getByText("Female")).toBeInTheDocument();
      expect(screen.getByText("Other")).toBeInTheDocument();
    });
  });
});
