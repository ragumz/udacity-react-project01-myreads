import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import ErrorBoundary from "./utils/ErrorBoundary";

ReactDOM.render(
  //Custom component for global error catch and treatment
  <ErrorBoundary>
    { /* React Router DOM component to manage routes */ }
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ErrorBoundary>,
  document.getElementById("root")
);
