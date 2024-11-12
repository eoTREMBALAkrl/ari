import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { useUsuario } from "../hooks/use-usuario";
import { formatDate } from "../hooks/formatDate";
import { usePrescricao } from "../hooks/use-prescricao";


type Prescription = {
    id: number;
    nome: string;
    observacao: string | null;
    frequencia: number;
    dataInicio: Date;
    dataFim: Date;
    paciente: {
        id: number;
        nome: string;
    };
    remedio: {
        id: number;
        nome: string;
        funcao: string;
        dosagem: string;
    };
};

const Prescricao: React.FC = () => {
  const { usuario } = useUsuario();
  const {prescricao,fetchPrescricao} = usePrescricao();
  const [newPrescription, setNewPrescription] = useState({
    idUsuario: usuario.id.toString(),
    idRemedio: "",
    frequencia: 1,
    observacao: "",
    dataInicio: "",
    dataFim: ""
  });
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrescricao();
  }, []);


  const handleAddPrescription = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3333/prescricao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newPrescription,
          idUsuario: Number(newPrescription.idUsuario),
          idRemedio: Number(newPrescription.idRemedio),
          dataInicio: new Date(newPrescription.dataInicio).toISOString(),
          dataFim: new Date(newPrescription.dataFim).toISOString()
        })
      });

      if (response.ok) {
        setNewPrescription({
          idUsuario: usuario.id.toString(),
          idRemedio: "",
          frequencia: 1,
          observacao: "",
          dataInicio: "",
          dataFim: ""
        });
        fetchPrescricao();
      } else {
        const errorData = await response.json();
        console.error("Erro ao adicionar prescrição:", errorData);
      }
    } catch (error) {
      console.error("Erro ao adicionar prescrição:", error);
    }
  };

  const handleEditPrescription = (prescription: Prescription) => {
    setEditingPrescription(prescription);
    setNewPrescription({
      idUsuario: usuario.id.toString(),
      idRemedio: prescription.remedio.id.toString(),
      frequencia: prescription.frequencia,
      observacao: prescription.observacao || "",
      dataInicio: formatDate(prescription.dataInicio.toISOString()),
      dataFim: formatDate(prescription.dataFim.toISOString())
    });
  };

  const handleUpdatePrescription = async () => {
    if (!editingPrescription) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/prescricao/${editingPrescription.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newPrescription,
          idUsuario: Number(newPrescription.idUsuario),
          idRemedio: Number(newPrescription.idRemedio),
          dataInicio: new Date(newPrescription.dataInicio).toISOString(),
          dataFim: new Date(newPrescription.dataFim).toISOString()
        })
      });

      if (response.ok) {
        setEditingPrescription(null);
        setNewPrescription({
          idUsuario: usuario.id.toString(),
          idRemedio: "",
          frequencia: 1,
          observacao: "",
          dataInicio: "",
          dataFim: ""
        });
        fetchPrescricao();
      } else {
        const errorData = await response.json();
        console.error("Erro ao atualizar prescrição:", errorData);
      }
    } catch (error) {
      console.error("Erro ao atualizar prescrição:", error);
    }
  };

  const handleDeletePrescription = async (prescriptionId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/prescricao/${prescriptionId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        fetchPrescricao();
      } else {
        const errorData = await response.json();
        console.error("Erro ao deletar prescrição:", errorData);
      }
    } catch (error) {
      console.error("Erro ao deletar prescrição:", error);
    }
  };

  return (
    <div className="prescriptions-container">
      <h1>Minhas Prescrições</h1>
      <button onClick={() => navigate("/home")} className="back-button">Voltar para Home</button>

      {error && <p className="error-message">{error}</p>}

      <div className="card">
        <h2>{editingPrescription ? "Editar Prescrição" : "Adicionar Nova Prescrição"}</h2>
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
        <button onClick={editingPrescription ? handleUpdatePrescription : handleAddPrescription}>
          {editingPrescription ? "Atualizar Prescrição" : "Adicionar Prescrição"}
        </button>
        {editingPrescription && (
          <button onClick={() => setEditingPrescription(null)} className="cancel-button">
            Cancelar Edição
          </button>
        )}
      </div>

      <h2>Lista de Prescrições</h2>
      <ul className="prescription-list">
        {prescricao.map((prescription) => (
          <li key={prescription.id} className="prescription-item">
            <p><strong>Paciente:</strong> {prescription.paciente.nome}</p>
            <p><strong>Remédio:</strong> {prescription.remedio.nome} - {prescription.remedio.dosagem}</p>
            <p><strong>Observação:</strong> {prescription.observacao || "Nenhuma"}</p>
            <p><strong>Frequência:</strong> {prescription.frequencia} vezes ao dia</p>
            <p><strong>Data Início:</strong> {new Date(prescription.dataInicio).toLocaleDateString()}</p>
            <p><strong>Data Fim:</strong> {new Date(prescription.dataFim).toLocaleDateString()}</p>
            <button onClick={() => handleEditPrescription(prescription)}>Editar</button>
            <button onClick={() => handleDeletePrescription(prescription.id)} className="delete-button">Deletar</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Prescricao;
