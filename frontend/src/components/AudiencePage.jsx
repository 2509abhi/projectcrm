import React, { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Audience = () => {
  const [rules, setRules] = useState([]);
  const [field, setField] = useState("");
  const [operator, setOperator] = useState("");
  const [value, setValue] = useState("");
  const [audienceSize, setAudienceSize] = useState(0);

  const fieldOptions = [
    { label: "Total Spend", value: "total_spend" },
    { label: "Visits", value: "visits" },
    { label: "Last Visit", value: "last_visit" },
  ];

  const operatorOptions = {
    total_spend: [">", ">=", "<", "<=", "=="],
    visits: [">", ">=", "<", "<=", "=="],
    last_visit: ["==", ">", "<"],
  };

  const addRule = () => {
    if (field && operator && value) {
      const newRule = { field, operator, value };
      setRules([...rules, newRule]);
      setField("");
      setOperator("");
      setValue("");
    } else {
      alert("Please enter a valid rule.");
    }
  };

  const removeRule = (index) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const checkAudienceSize = async () => {
    try {
      const response = await axios.post(
        "https://projectcrm-dgrs.onrender.com/api/check-audience",
        { rules }
      );
      setAudienceSize(response.data.audienceSize);
    } catch (error) {
      console.error("Error checking audience size:", error);
    }
  };

  const saveAudience = async () => {
    try {
      await axios.post("https://projectcrm-dgrs.onrender.com/api/save-audience", { rules });
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Error saving audience:", error);
    }
  };

  const renderValueInput = () => {
    if (field === "last_visit") {
      return (
        <DatePicker
          selected={value ? new Date(value) : null}
          onChange={(date) => setValue(date.toISOString().split("T")[0])}
          className="form-control"
          dateFormat="yyyy-MM-dd"
        />
      );
    } else {
      return (
        <input
          type="text"
          className="form-control"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      );
    }
  };

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark">
        <a className="navbar-brand" href="/dashboard">
          AlwaysLearn
        </a>
      </nav>
      <div className="container mt-5">
        <h2>Create Audience</h2>
        <div className="input-group mb-3">
          <select
            className="form-control"
            value={field}
            onChange={(e) => {
              setField(e.target.value);
              setOperator("");
              setValue("");
            }}
          >
            <option value="">Select Field</option>
            {fieldOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="form-control"
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
          >
            <option value="">Select Operator</option>
            {field &&
              operatorOptions[field].map((op) => (
                <option key={op} value={op}>
                  {op}
                </option>
              ))}
          </select>
          {renderValueInput()}
          <div className="input-group-append">
            <button className="btn btn-outline-secondary" onClick={addRule}>
              Add Rule
            </button>
          </div>
        </div>
        <ul className="list-group mb-3">
          {rules.map((rule, index) => (
            <li
              key={index}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {`${rule.field} ${rule.operator} ${rule.value}`}
              <button
                className="btn btn-danger btn-sm"
                onClick={() => removeRule(index)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button className="btn btn-primary mb-3" onClick={checkAudienceSize}>
          Check Audience Size
        </button>
        <p>Audience Size: {audienceSize}</p>
        <button className="btn btn-success" onClick={saveAudience}>
          Save Audience
        </button>
      </div>
    </div>
  );
};

export default Audience;
