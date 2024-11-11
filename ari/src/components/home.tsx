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
  const [timers, setTimers] = useState<{ [key: number]: string }>({});
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

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedTimers: { [key: number]: string } = {};

      prescriptions.forEach((prescription) => {
        const lastDoseTime = new Date(prescription.dataInicio).getTime();
        const nextDoseTime = lastDoseTime + prescription.frequencia * 60 * 60 * 1000;
        const remainingTime = nextDoseTime - Date.now();

        if (remainingTime > 0) {
          const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((remainingTime / (1000 * 60)) % 60);
          const seconds = Math.floor((remainingTime / 1000) % 60);
          updatedTimers[prescription.id] = `${hours}h ${minutes}m ${seconds}s`;
        } else {
          updatedTimers[prescription.id] = "Hora de tomar o remédio!";
        }
      });

      setTimers(updatedTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [prescriptions]);

  const handleTakeMedication = async (prescriptionId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token de autenticação não encontrado");
      return;
    }

    try {
      const currentTime = new Date().toISOString();
      const response = await fetch(`http://localhost:3333/prescricao/${prescriptionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dataInicio: currentTime }),
      });

      if (response.ok) {
        // Atualizar a lista de prescrições para refletir a nova data de início
        setPrescriptions((prevPrescriptions) =>
          prevPrescriptions.map((prescription) =>
            prescription.id === prescriptionId ? { ...prescription, dataInicio: currentTime } : prescription
          )
        );
      } else {
        alert("Erro ao atualizar o horário de tomada do remédio.");
      }
    } catch (error) {
      console.error("Erro ao marcar remédio como tomado:", error);
    }
  };

  return (
    <div className="home-container">
      <h1>Bem-vindo ao Agendamento de Remédios para Idosos</h1>

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
                <p><strong>Próxima Dose em:</strong> {timers[prescription.id]}</p>
                <button onClick={() => handleTakeMedication(prescription.id)} className="take-button">
                  Tomei o Remédio
                </button>
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
