// src/components/Home.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../App.css";

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
  frequencia: number;
  dataInicio: string;
  dataFim: string;
  status: boolean;
};

type TokenPayload = {
  id: number;
};

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token de autenticação não encontrado");

        const decoded = jwtDecode<TokenPayload>(token);
        const userId = decoded.id;

        const userResponse = await fetch(`http://localhost:3333/usuario/${userId}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (userResponse.status === 401) throw new Error("Não autorizado");

        const userData = await userResponse.json();
        setUser(userData.usuario);

        const medicinesResponse = await fetch("http://localhost:3333/remedio", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (medicinesResponse.status === 401) throw new Error("Não autorizado");

        const medicinesData = await medicinesResponse.json();
        setMedicines(Array.isArray(medicinesData.remedios) ? medicinesData.remedios : []);

        const prescriptionsResponse = await fetch("http://localhost:3333/prescricao", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (prescriptionsResponse.status === 401) throw new Error("Não autorizado");

        const prescriptionsData = await prescriptionsResponse.json();
        setPrescriptions(Array.isArray(prescriptionsData.prescricoes) ? prescriptionsData.prescricoes : []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        alert("Sessão expirada. Faça login novamente.");
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="home-container">
      <h1>Bem-vindo ao Sistema de Monitoramento de Medicamentos</h1>

      {/* Card de Informações do Usuário */}
      <div className="card">
        <h2>Informações do Paciente</h2>
        {user ? (
          <div className="user-info">
            <p><strong>Nome:</strong> {user.nome}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Status:</strong> {user.status ? "Ativo" : "Inativo"}</p>
          </div>
        ) : (
          <p>Carregando dados do paciente...</p>
        )}
      </div>

      {/* Card de Medicamentos */}
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

      {/* Card de Prescrições */}
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

      {/* Botões de Navegação */}
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
