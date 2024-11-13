// src/components/Home.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { useUsuario } from "../hooks/use-usuario";
import { usePrescricao } from "../hooks/use-prescricao";
import dayjs from "dayjs";
import "dayjs/locale/pt-br"

dayjs.locale("pt-br")


type Medicine = {
  id: number;
  nome: string;
  funcao: string;
  dosagem: string;
  status: boolean;
};

type Historico = {
  idRemedio: number;
    nomeRemedio: string;
    dosagem: string;
    funcao: string;
    observacao: string | null;
    frequencia: number;
    dataInicio: Date;
    data: Date;
};

const Home: React.FC = () => {
  const { usuario } = useUsuario();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const {prescricao} =usePrescricao();
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [selectedPrescription, setSelectedPrescription] = useState<number | null>(null);
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
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        alert("Sessão expirada. Faça login novamente.");
        navigate("/");
      }
    };

    fetchData();
  }, [navigate]);

  const fetchHistorico = async (idPrescricao: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de autenticação não encontrado");

      const response = await fetch(`http://localhost:3333/historico/${idPrescricao}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setHistorico(data.historico);
        setSelectedPrescription(idPrescricao);
      } else {
        console.error("Erro ao buscar histórico");
      }
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    }
  };

  const createHistorico = async(idPrescricao: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de autenticação não encontrado");

      const response = await fetch(`http://localhost:3333/historico/${idPrescricao}`, {
        headers: { Authorization: `Bearer ${token}` },
        method:"POST"
      });

    } catch (error) {
      console.error("Erro ao criar histórico:", error);
    }
  };

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
                <p><strong>ID:</strong> {medicine.id}</p>
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
        {prescricao.length > 0 ? (
          <ul className="prescription-list">
            {prescricao.map((prescription) => (
              <li key={prescription.id} className="prescription-item">
                <p><strong>Remédio:</strong> {prescription.remedio.nome}</p>
                <p><strong>Observação:</strong> {prescription.observacao || "Nenhuma"}</p>
                <p><strong>Frequência:</strong> {prescription.frequencia} vezes ao dia</p>
                <p><strong>Data Início:</strong> {new Date(prescription.dataInicio).toLocaleDateString()}</p>
                <p><strong>Data Fim:</strong> {new Date(prescription.dataFim).toLocaleDateString()}</p>
                <button onClick={() => fetchHistorico(prescription.id)}>Ver Histórico</button>
                <button onClick={() => createHistorico(prescription.id)}>Tomar Remedio</button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhuma prescrição encontrada.</p>
        )}
      </div>
      {selectedPrescription && (
        <div className="historico-modal">
          <h2>Histórico de Tomadas</h2>
          <button onClick={() => setSelectedPrescription(null)} className="close-button">Fechar</button>
          
          <ul>
          <li>
                <p><strong>Remédio:</strong> {historico[0].nomeRemedio}</p>
                <p><strong>Dosagem:</strong> {historico[0].dosagem}</p>
                <p><strong>Função:</strong> {historico[0].funcao}</p>
                <p><strong>Observação:</strong> {historico[0].observacao || "Nenhuma"}</p>
                <p><strong>Frequência:</strong> {historico[0].frequencia} vezes ao dia</p>
              </li>
              <strong>Datas tomadas:</strong> 
            {historico.map((hist, index) => (
              <li key={index}>
                <p>{dayjs(hist.data).locale("pt-br").format("DD [de] MMMM YYYY HH:mm")}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

    
      <div className="navigation-buttons">
        <button onClick={() => navigate("/remedio")}>Remédios</button>
        <button onClick={() => navigate("/prescricao")}>Prescrições</button>
        <button onClick={() => navigate("/responsavel")}>Responsável</button>
      </div>
    </div>
  );
};

export default Home;
