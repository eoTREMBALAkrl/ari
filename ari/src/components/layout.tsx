// src/components/Layout.tsx
import React, { useEffect } from "react";
import {Outlet } from "react-router-dom";
import { useUsuario } from "../hooks/use-usuario";

const Layout: React.FC = () => {
    const {fetchUsuario}=useUsuario()
    useEffect(()=>{fetchUsuario()},[] )
    
  return (
    <><Outlet/>
    </>
  )

};

export default Layout;
