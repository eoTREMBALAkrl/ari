// src/components/Remedio.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css"

type Medicine = {
  id: number;
  nome: string;
  funcao: string;
  dosagem: string;
  status: boolean;
};

const Remedio: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [newMedicine, setNewMedicine] = useState({ nome: "", funcao: "", dosagem: "" });
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch("http://localhost:3333/remedio", {
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Não autorizado. Faça login novamente.");
        throw new Error("Erro ao buscar os remédios.");
      }

      const data = await response.json();
      setMedicines(Array.isArray(data.remedios) ? data.remedios : []);
    } catch (error: any) {
      setError(error.message);
      if (error.message.includes("Não autorizado")) navigate("/login");
    }
  };

  const handleAddMedicine = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3333/remedio", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(newMedicine),
      });

      if (response.ok) {
        fetchMedicines();
        setNewMedicine({ nome: "", funcao: "", dosagem: "" });
      }
    } catch (error) {
      setError("Erro ao adicionar remédio.");
    }
  };

  const handleEditMedicine = async () => {
    if (!editingMedicine) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/remedio/${editingMedicine.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(editingMedicine),
      });

      if (response.ok) {
        fetchMedicines();
        setEditingMedicine(null);
      }
    } catch (error) {
      setError("Erro ao editar remédio.");
    }
  };

  const handleDeleteMedicine = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/remedio/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });

      if (response.ok) fetchMedicines();
    } catch (error) {
      setError("Erro ao deletar remédio.");
    }
  };

  return (
    <div className="medicines-container">
      <h1>Lista de Remédios</h1>
      {error && <p className="error-message">{error}</p>}
      <button onClick={() => navigate("/home")} className="back-button">Voltar para Home</button>
      <h2>Adicionar Novo Remédio</h2>
      <input
        type="text"
        placeholder="Nome"
        value={newMedicine.nome}
        onChange={(e) => setNewMedicine({ ...newMedicine, nome: e.target.value })}
      />
      <input
        type="text"
        placeholder="Função"
        value={newMedicine.funcao}
        onChange={(e) => setNewMedicine({ ...newMedicine, funcao: e.target.value })}
      />
      <input
        type="text"
        placeholder="Dosagem"
        value={newMedicine.dosagem}
        onChange={(e) => setNewMedicine({ ...newMedicine, dosagem: e.target.value })}
      />
      <button onClick={handleAddMedicine}>Adicionar</button>

      {medicines && medicines.length > 0 ? (
        <ul>
          {medicines.map((medicine) => (
            <li key={medicine.id} className="medicine-item">
              {editingMedicine?.id === medicine.id ? (
                <>
                  <input
                    type="text"
                    value={editingMedicine.nome}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, nome: e.target.value })}
                  />
                  <input
                    type="text"
                    value={editingMedicine.funcao}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, funcao: e.target.value })}
                  />
                  <input
                    type="text"
                    value={editingMedicine.dosagem}
                    onChange={(e) => setEditingMedicine({ ...editingMedicine, dosagem: e.target.value })}
                  />
                  <button onClick={handleEditMedicine}>Salvar</button>
                  <button onClick={() => setEditingMedicine(null)}>Cancelar</button>
                </>
              ) : (
                <>
                  <p><strong>Nome:</strong> {medicine.nome}</p>
                  <p><strong>Função:</strong> {medicine.funcao}</p>
                  <p><strong>Dosagem:</strong> {medicine.dosagem}</p>
                  <button onClick={() => setEditingMedicine(medicine)}>Editar</button>
                  <button onClick={() => handleDeleteMedicine(medicine.id)}>Deletar</button>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum remédio encontrado.</p>
      )}
    </div>
  );
};

export default Remedio;
