import { create } from "zustand"
import { jwtDecode } from "jwt-decode";

interface PrescricaoStore {
    prescricao: {
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
    }[],
    fetchPrescricao: () => Promise<void>
}
type TokenPayload = {
    id: number;
  };

export const usePrescricao = create<PrescricaoStore>((set) => ({
   prescricao: [],

    fetchPrescricao: async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("Token de autenticação não encontrado");
    
            const decoded = jwtDecode<TokenPayload>(token);
            const idPrescricao = decoded.id;
    
            const userResponse = await fetch(`http://localhost:3333/prescricao/${idPrescricao}`, {
              headers: { "Authorization": `Bearer ${token}` },
            });
    
            if (userResponse.status === 401) throw new Error("Não autorizado");
    
            const userData = await userResponse.json();
            set({
                prescricao:userData.prescricao
            })
        } catch (error) {
            console.error("Erro ao buscar prescricao:", error);
        }
    }
}));
