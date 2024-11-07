// src/components/Prescricao.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"

type Medicine = {
  id: number;
  nome: string;
  dosagem: string;
};

type User = {
  id: number;
  nome: string;
};

type Prescription = {
  id: number;
  usuario: User;
  remedio: Medicine;
  observacao?: string;
  frequencia: number;
  dataInicio: string;
  dataFim: string;
  status: boolean;
};

const Prescricao: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [newPrescription, setNewPrescription] = useState({
    idUsuario: "",
    idRemedio: "",
    observacao: "",
    frequencia: 1,
    dataInicio: "",
    dataFim: ""
  });
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de autenticação não encontrado");

      const response = await fetch("http://localhost:3333/prescricao", {
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error("Erro ao buscar prescrições");
      }

      const data = await response.json();
      setPrescriptions(data);
    } catch (error: any) {
      console.error("Erro ao buscar prescrições:", error);
      if (error.message === "Não autorizado") navigate("/login");
    }
  };

  const handleAddPrescription = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3333/prescricao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newPrescription)
      });

      if (response.ok) {
        fetchPrescriptions();
        setNewPrescription({
          idUsuario: "",
          idRemedio: "",
          observacao: "",
          frequencia: 1,
          dataInicio: "",
          dataFim: ""
        });
      }
    } catch (error) {
      console.error("Erro ao adicionar prescrição:", error);
    }
  };

  const handleEditPrescription = async () => {
    if (!editingPrescription) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/prescricao/${editingPrescription.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(editingPrescription)
      });

      if (response.ok) {
        fetchPrescriptions();
        setEditingPrescription(null);
      }
    } catch (error) {
      console.error("Erro ao editar prescrição:", error);
    }
  };

  const handleDeletePrescription = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/prescricao/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (response.ok) fetchPrescriptions();
    } catch (error) {
      console.error("Erro ao deletar prescrição:", error);
    }
  };

  return (
    <div className="prescriptions-container">
      <h1>Prescrições</h1>
      <button onClick={() => navigate("/")} className="back-button">Voltar para Home</button>

      <div className="card">
        <h2>Adicionar Nova Prescrição</h2>
        <input
          type="text"
          placeholder="ID do Usuário"
          value={newPrescription.idUsuario}
          onChange={(e) => setNewPrescription({ ...newPrescription, idUsuario: e.target.value })}
        />
        <input
          type="text"
          placeholder="ID do Remédio"
          value={newPrescription.idRemedio}
          onChange={(e) => setNewPrescription({ ...newPrescription, idRemedio: e.target.value })}
        />
        <input
          type="text"
          placeholder="Observação"
          value={newPrescription.observacao}
          onChange={(e) => setNewPrescription({ ...newPrescription, observacao: e.target.value })}
        />
        <input
          type="number"
          placeholder="Frequência"
          value={newPrescription.frequencia}
          onChange={(e) => setNewPrescription({ ...newPrescription, frequencia: Number(e.target.value) })}
        />
        <input
          type="date"
          placeholder="Data Início"
          value={newPrescription.dataInicio}
          onChange={(e) => setNewPrescription({ ...newPrescription, dataInicio: e.target.value })}
        />
        <input
          type="date"
          placeholder="Data Fim"
          value={newPrescription.dataFim}
          onChange={(e) => setNewPrescription({ ...newPrescription, dataFim: e.target.value })}
        />
        <button onClick={handleAddPrescription}>Adicionar Prescrição</button>
      </div>

      <h2>Lista de Prescrições</h2>
      <ul className="prescription-list">
        {prescriptions.map((prescription) => (
          <li key={prescription.id} className="prescription-item">
            {editingPrescription?.id === prescription.id ? (
              <>
                <input
                  type="text"
                  value={editingPrescription.observacao || ""}
                  onChange={(e) => setEditingPrescription({ ...editingPrescription, observacao: e.target.value })}
                />
                <input
                  type="number"
                  value={editingPrescription.frequencia}
                  onChange={(e) => setEditingPrescription({ ...editingPrescription, frequencia: Number(e.target.value) })}
                />
                <input
                  type="date"
                  value={editingPrescription.dataInicio}
                  onChange={(e) => setEditingPrescription({ ...editingPrescription, dataInicio: e.target.value })}
                />
                <input
                  type="date"
                  value={editingPrescription.dataFim}
                  onChange={(e) => setEditingPrescription({ ...editingPrescription, dataFim: e.target.value })}
                />
                <button onClick={handleEditPrescription}>Salvar</button>
                <button onClick={() => setEditingPrescription(null)}>Cancelar</button>
              </>
            ) : (
              <>
                <p><strong>Remédio:</strong> {prescription.remedio.nome} ({prescription.remedio.dosagem})</p>
                <p><strong>Observação:</strong> {prescription.observacao || "Nenhuma"}</p>
                <p><strong>Frequência:</strong> {prescription.frequencia} vezes ao dia</p>
                <p><strong>Data Início:</strong> {new Date(prescription.dataInicio).toLocaleDateString()}</p>
                <p><strong>Data Fim:</strong> {new Date(prescription.dataFim).toLocaleDateString()}</p>
                <button onClick={() => setEditingPrescription(prescription)}>Editar</button>
                <button onClick={() => handleDeletePrescription(prescription.id)}>Deletar</button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Prescricao;
