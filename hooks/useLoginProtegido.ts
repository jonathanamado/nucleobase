// hooks/useLoginProtegido.ts
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export function useLoginProtegido() {
    const [emailOrSlug, setEmailOrSlug] = useState("");
    const [password, setPassword] = useState("");
    const [authLoading, setAuthLoading] = useState(false);
    const [loginError, setLoginError] = useState("");

    // Estados de proteção de tentativas
    const [tentativasErradas, setTentativasErradas] = useState(0);
    const [tempoBloqueio, setTempoBloqueio] = useState(0);

    // Efeito para a contagem regressiva do bloqueio temporário
    useEffect(() => {
        let timer: any = null;
        if (tempoBloqueio > 0) {
            timer = setInterval(() => {
                setTempoBloqueio((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [tempoBloqueio]);

    const tratarErroLogin = (mensagem: string) => {
        const novasTentativas = tentativasErradas + 1;
        setTentativasErradas(novasTentativas);

        if (novasTentativas >= 3) {
            setTempoBloqueio(30); // Bloqueia por 30 segundos após 3 erros
            setLoginError("Muitas tentativas incorretas. Aguarde 30 segundos para tentar novamente.");
        } else {
            setLoginError(mensagem);
        }
        setAuthLoading(false);
    };

    const resetarBloqueio = () => {
        setTentativasErradas(0);
        setTempoBloqueio(0);
    };

    return {
        emailOrSlug,
        setEmailOrSlug,
        password,
        setPassword,
        authLoading,
        setAuthLoading,
        loginError,
        setLoginError,
        tempoBloqueio,
        tratarErroLogin,
        resetarBloqueio
    };
}