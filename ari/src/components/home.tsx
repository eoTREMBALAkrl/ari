// src/components/Home.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const Home: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Buscar as informações do paciente, medicamentos e prescrições
    const fetchData = async () => {
      try {
        const userResponse = await fetch("http://localhost:3333/api/usuario");
        const userData = await userResponse.json();
        setUser(userData);

        const medicinesResponse = await fetch("http://localhost:3333/api/remedio");
        const medicinesData = await medicinesResponse.json();
        setMedicines(medicinesData);

        const prescriptionsResponse = await fetch("http://localhost:3333/api/prescricao");
        const prescriptionsData = await prescriptionsResponse.json();
        setPrescriptions(prescriptionsData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home-container">
      <h1>Informações do Paciente</h1>
      {user && (
        <div>
          <p><strong>Nome:</strong> {user.nome}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Status:</strong> {user.status ? "Ativo" : "Inativo"}</p>
        </div>
      )}

      <h2>Medicamentos</h2>
      <ul>
        {medicines.map((medicine) => (
          <li key={medicine.id}>
            <p><strong>Nome:</strong> {medicine.nome}</p>
            <p><strong>Função:</strong> {medicine.funcao}</p>
            <p><strong>Dosagem:</strong> {medicine.dosagem}</p>
          </li>
        ))}
      </ul>

      <h2>Prescrições</h2>
      <ul>
        {prescriptions.map((prescription) => (
          <li key={prescription.id}>
            <p><strong>Remédio:</strong> {prescription.remedio.nome}</p>
            <p><strong>Observação:</strong> {prescription.observacao || "Nenhuma"}</p>
            <p><strong>Frequência:</strong> {prescription.frequencia} vezes ao dia</p>
            <p><strong>Data Início:</strong> {new Date(prescription.dataInicio).toLocaleDateString()}</p>
            <p><strong>Data Fim:</strong> {new Date(prescription.dataFim).toLocaleDateString()}</p>
          </li>
        ))}
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
