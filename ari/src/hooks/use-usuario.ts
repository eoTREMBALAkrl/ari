import { create } from "zustand"
import { jwtDecode } from "jwt-decode";

interface UsuarioStore {
    usuario: {
        id: number,
        nome: string,
        email: string,
    },
    fetchUsuario: () => Promise<void>
}
type TokenPayload = {
    id: number;
  };

export const useUsuario = create<UsuarioStore>((set) => ({
    usuario: {
        id: 0,
        nome: "",
        email: "",
    },
    fetchUsuario: async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Token de autenticação não encontrado");
    
            const decoded = jwtDecode<TokenPayload>(token);
            const userId = decoded.id;
    
            const userResponse = await fetch(`http://localhost:3333/usuario/${userId}`, {
              headers: { "Authorization": `Bearer ${token}` },
            });
    
            if (userResponse.status === 401) throw new Error("Não autorizado");
    
            const userData = await userResponse.json();
            set({
                usuario:userData.usuario
            })
        } catch (error) {
            console.error("Erro ao buscar usuário:", error);
        }
    }
}));
