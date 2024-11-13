// src/components/Responsavel.tsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { useUsuario } from "../hooks/use-usuario";

type Responsavel = {
  id: number;
  nome: string;
  email: string;
};

const Responsavel: React.FC = () => {
  const { usuario } = useUsuario();
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [newResponsavelId, setNewResponsavelId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario.id) fetchResponsaveis();
  }, [usuario.id]);

  const fetchResponsaveis = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token de autenticação não encontrado");

      const response = await fetch(`http://localhost:3333/responsavel/${usuario.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) throw new Error("Não autorizado. Faça login novamente.");
        throw new Error("Erro ao buscar responsáveis.");
      }

      const data = await response.json();
      console.log("Responsáveis recebidos:", data);  // Para verificar a resposta no console
      setResponsaveis(Array.isArray(data.responsavel) ? data.responsavel : []);
    } catch (error: any) {
      setError(error.message);
      if (error.message.includes("Não autorizado")) navigate("/login");
    }
  };

  const handleAddResponsavel = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:3333/responsavel", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ idUsuario: Number(newResponsavelId), idPaciente: usuario.id }),
      });

      if (response.ok) {
        setNewResponsavelId("");
        fetchResponsaveis();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao adicionar responsável.");
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleDeleteResponsavel = async (responsavelId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:3333/responsavel`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ idUsuario: responsavelId, idPaciente: usuario.id }),
      });

      if (response.ok) {
        fetchResponsaveis();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Erro ao remover responsável.");
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="responsavel-container">
      <h1>Gerenciar Responsáveis</h1>
      {error && <p className="error-message">{error}</p>}
      <button onClick={() => navigate("/home")} className="back-button">Voltar para Home</button>

      <div className="card">
        <h2>Adicionar Novo Responsável</h2>
        <input
          type="text"
          placeholder="ID do Responsável"
          value={newResponsavelId}
          onChange={(e) => setNewResponsavelId(e.target.value)}
        />
        <button onClick={handleAddResponsavel}>Adicionar Responsável</button>
      </div>

      <h2>Lista de Responsáveis</h2>
      {responsaveis.length > 0 ? (
        <ul className="responsavel-list">
          {responsaveis.map((responsavel) => (
            <li key={responsavel.id} className="responsavel-item">
              <p><strong>Nome:</strong> {responsavel.nome}</p>
              <p><strong>Email:</strong> {responsavel.email}</p>
              <button onClick={() => handleDeleteResponsavel(responsavel.id)} className="delete-button">
                Remover Responsável
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Nenhum responsável encontrado.</p>
      )}
    </div>
  );
};

export default Responsavel;
