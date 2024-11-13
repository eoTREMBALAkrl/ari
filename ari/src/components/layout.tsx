import React, { useEffect } from "react";
import {Outlet } from "react-router-dom";
import { useUsuario } from "../hooks/use-usuario";
import { usePrescricao } from "../hooks/use-prescricao";

const Layout: React.FC = () => {
    const {fetchUsuario}=useUsuario()
    const {fetchPrescricao}=usePrescricao()

    useEffect(()=>{fetchUsuario();fetchPrescricao()},[] )
    
  return (
    <><Outlet/>
    </>
  )

};

export default Layout;
