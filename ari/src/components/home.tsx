import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { useUsuario } from "../hooks/use-usuario";

type User = {
  id: number;
  nome: string;
  email: string;
  status: boolean;
};

type Medicine = {
  id: number;
  nome: string;
  funcao: string;
  dosagem: string;
  status: boolean;
};

type Prescription = {
  id: number;
  remedio: Medicine;
  observacao?: string;
  frequencia: number; // Em horas
  dataInicio: string;
  dataFim: string;
  status: boolean;
};

const Home: React.FC = () => {
  const { usuario } = useUsuario();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token de autenticação não encontrado");

        const medicinesResponse = await fetch("http://localhost:3333/remedio", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (medicinesResponse.status === 401) throw new Error("Não autorizado");
        const medicinesData = await medicinesResponse.json();
        setMedicines(Array.isArray(medicinesData.remedios) ? medicinesData.remedios : []);

        const prescriptionsResponse = await fetch(`http://localhost:3333/prescricao/${usuario.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (prescriptionsResponse.status === 401) throw new Error("Não autorizado");
        const prescriptionsData = await prescriptionsResponse.json();
        setPrescriptions(Array.isArray(prescriptionsData.prescricao) ? prescriptionsData.prescricao : []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        alert("Sessão expirada. Faça login novamente.");
        navigate("/");
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("http://localhost:3333/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        alert("Deslogado com sucesso!");
        navigate("/");
      } else {
        console.error("Erro ao deslogar:", await response.json());
      }
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
  };

  return (
    <div className="home-container">
      <h1>Bem-vindo ao Agendamento de Remédios para Idosos</h1>
      
      <button onClick={handleLogout} className="logout-button">Logout</button>

      <div className="card">
        <h2>Informações do Paciente</h2>
        {usuario ? (
          <div className="user-info">
            <p><strong>Id:</strong> {usuario.id}</p>
            <p><strong>Nome:</strong> {usuario.nome}</p>
            <p><strong>Email:</strong> {usuario.email}</p>
          </div>
        ) : (
          <p>Carregando dados do paciente...</p>
        )}
      </div>

      <div className="card">
        <h2>Medicamentos</h2>
        {medicines.length > 0 ? (
          <ul className="medicine-list">
            {medicines.map((medicine) => (
              <li key={medicine.id} className="medicine-item">
                <p><strong>Nome:</strong> {medicine.nome}</p>
                <p><strong>Função:</strong> {medicine.funcao}</p>
                <p><strong>Dosagem:</strong> {medicine.dosagem}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum medicamento encontrado.</p>
        )}
      </div>

      <div className="card">
        <h2>Prescrições</h2>
        {prescriptions.length > 0 ? (
          <ul className="prescription-list">
            {prescriptions.map((prescription) => (
              <li key={prescription.id} className="prescription-item">
                <p><strong>Remédio:</strong> {prescription.remedio.nome}</p>
                <p><strong>Observação:</strong> {prescription.observacao || "Nenhuma"}</p>
                <p><strong>Frequência:</strong> {prescription.frequencia} vezes ao dia</p>
                <p><strong>Data Início:</strong> {new Date(prescription.dataInicio).toLocaleDateString()}</p>
                <p><strong>Data Fim:</strong> {new Date(prescription.dataFim).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma prescrição encontrada.</p>
        )}
      </div>

      <div className="navigation-buttons">
        <button onClick={() => navigate("/remedio")}>Remédios</button>
        <button onClick={() => navigate("/prescricao")}>Prescrições</button>
        <button onClick={() => navigate("/historico")}>Histórico</button>
        <button onClick={() => navigate("/responsavel")}>Responsável</button>
      </div>
    </div>
  );
};

export default Home;
