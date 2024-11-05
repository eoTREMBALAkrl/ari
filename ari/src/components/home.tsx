// src/components/Home.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";

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
        if (!token) {
          throw new Error("Token de autenticação não encontrado");
        }

        // Decodifica o token para extrair o userId
        const decoded = jwtDecode<TokenPayload>(token);
        const userId = decoded.id;

        // Busca informações do usuário logado
        const userResponse = await fetch(`http://localhost:3333/usuario/${userId}`, {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (userResponse.status === 401) {
          throw new Error("Não autorizado");
        }

        const userData = await userResponse.json();
        setUser(userData.usuario); // Atualiza o estado com os dados do usuário

        // Busca medicamentos do usuário
        const medicinesResponse = await fetch("http://localhost:3333/remedio", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (medicinesResponse.status === 401) {
          throw new Error("Não autorizado");
        }

        const medicinesData = await medicinesResponse.json();
        setMedicines(Array.isArray(medicinesData) ? medicinesData : []);

        // Busca prescrições do usuário
        const prescriptionsResponse = await fetch("http://localhost:3333/prescricao", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (prescriptionsResponse.status === 401) {
          throw new Error("Não autorizado");
        }

        const prescriptionsData = await prescriptionsResponse.json();
        setPrescriptions(Array.isArray(prescriptionsData) ? prescriptionsData : []);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        
        if (error.message === "Não autorizado") {
          alert("Sessão expirada. Faça login novamente.");
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="home-container">
      <h1>Informações do Paciente</h1>
      {user ? (
        <div>
          <p><strong>Nome:</strong> {user.nome}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Status:</strong> {user.status ? "Ativo" : "Inativo"}</p>
        </div>
      ) : (
        <p>Carregando dados do paciente...</p>
      )}

      <h2>Medicamentos</h2>
      <ul>
        {medicines.length > 0 ? (
          medicines.map((medicine) => (
            <li key={medicine.id}>
              <p><strong>Nome:</strong> {medicine.nome}</p>
              <p><strong>Função:</strong> {medicine.funcao}</p>
              <p><strong>Dosagem:</strong> {medicine.dosagem}</p>
            </li>
          ))
        ) : (
          <p>Nenhum medicamento encontrado.</p>
        )}
      </ul>

      <h2>Prescrições</h2>
      <ul>
        {prescriptions.length > 0 ? (
          prescriptions.map((prescription) => (
            <li key={prescription.id}>
              <p><strong>Remédio:</strong> {prescription.remedio.nome}</p>
              <p><strong>Observação:</strong> {prescription.observacao || "Nenhuma"}</p>
              <p><strong>Frequência:</strong> {prescription.frequencia} vezes ao dia</p>
              <p><strong>Data Início:</strong> {new Date(prescription.dataInicio).toLocaleDateString()}</p>
              <p><strong>Data Fim:</strong> {new Date(prescription.dataFim).toLocaleDateString()}</p>
            </li>
          ))
        ) : (
          <p>Nenhuma prescrição encontrada.</p>
        )}
      </ul>

      {/* Navegação para outras páginas */}
      <div className="navigation-buttons">
        <button onClick={() => navigate("/remedio")}>Remédio</button>
        <button onClick={() => navigate("/prescricao")}>Prescrição</button>
        <button onClick={() => navigate("/historico")}>Histórico</button>
        <button onClick={() => navigate("/responsavel")}>Responsável</button>
      </div>
    </div>
  );
};

export default Home;
