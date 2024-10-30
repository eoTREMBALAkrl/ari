// src/components/Login.tsx
import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import Button from "./button";
import "../App.css";
import { useNavigate } from "react-router-dom";

type FormValues = {
  email: string;
  senha: string;
};

const Login: React.FC = () => {
  const { register, handleSubmit } = useForm<FormValues>();
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      // Envia a requisição POST para a API de login
      const response = await fetch("http://localhost:3333/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao realizar login");
      }

      const result = await response.json();
      console.log("Login bem-sucedido:", result);

      // Salva o token ou dados de usuário se necessário
      localStorage.setItem("token", result.token); // Exemplo de armazenamento do token

      // Redireciona o usuário para a página principal
      navigate("/home");
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao fazer login. Verifique as credenciais.");
    }
  };

  return (
    <div className="centered-container">
      <div className="centered-div">
        <h2>LOGIN - ARI</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          <label>Email:</label>
          <br />
          <input type="email" {...register("email")} required />
          <br />
          <label>Senha:</label>
          <br />
          <input type="password" {...register("senha")} required />
          <br />
          <br />
          <Button type="submit">Login</Button>
          <br />
          <Button onClick={() => navigate("/cadastro")}>Cadastro</Button>
        </form>
      </div>
    </div>
  );
};

export default Login;
