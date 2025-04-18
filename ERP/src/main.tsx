import React from "react";
import ReactDOM from "react-dom/client"; 
import AppRoutes from "./routes/index";
import { BrowserRouter } from "react-router-dom";
import "./index.css"; // Tailwind CSS 포함

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>
);
