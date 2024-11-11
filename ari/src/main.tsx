// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import Login from "../src/components/login";
import Cadastro from "../src/components/cadastro";
import Home from "../src/components/home";
import Remedio from "./components/remedio";
import Prescricao from "./components/prescricao";
import Layout from "./components/layout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/remedio" element={<Remedio />} />
          <Route path="/prescricao" element={<Prescricao />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
