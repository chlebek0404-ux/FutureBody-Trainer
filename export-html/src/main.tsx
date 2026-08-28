import React from "react";
import { createRoot } from "react-dom/client";

import MovendoApp from "../../components/movendo-app";
import "../../app/globals.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MovendoApp />
  </React.StrictMode>,
);
