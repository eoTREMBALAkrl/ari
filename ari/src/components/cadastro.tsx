// src/components/Cadastro.tsx
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Button from "./button";
import "../App.css";
import { useNavigate } from "react-router-dom";

type FormValues = {
  nome: string;
  email: string;
  senha: string;
  data: string; // string para capturar a data de nascimento em formato "YYYY-MM-DD"
};

const Cadastro: React.FC = () => {
  const { register, handleSubmit } = useForm<FormValues>();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const response = await fetch("http://localhost:3333/usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao realizar cadastro");
      }

      const result = await response.json();
      console.log("Cadastro bem-sucedido:", result);
      
      navigate("/");
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao realizar o cadastro. Verifique os dados e tente novamente.");
    }
  };

  return (
    <div className="centered-container">
      <div className="centered-div">
        <h2>Cadastro</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Nome:</label>
          <br />
          <input type="text" {...register("nome")} required />
          <br />
          <label>Email:</label>
          <br />
          <input type="email" {...register("email")} required />
          <br />
          <label>Senha:</label>
          <br />
          <input type="password" {...register("senha")} required />
          <br />
          <label>Data de Nascimento:</label>
          <br />
          <input type="date" {...register("data")} required />
          <br />
          <br />
          <Button type="submit">Cadastrar</Button>
          <br />
          <br />
          <Button onClick={() => navigate("/")}>Voltar ao Login</Button>
        </form>
      </div>
    </div>
  );
};

export default Cadastro;
