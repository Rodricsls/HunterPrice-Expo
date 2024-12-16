import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import * as SecureStore from "expo-secure-store";
import API_BASE_URL from "@/constants/api";

type User = {
    id: string;
    nombre: string;
};

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null); // Tipo explícito para el usuario
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await SecureStore.getItemAsync("user_token");
                console.log("Token obtenido:", token);

                if (token) {
                    // Verificar token en el backend
                    const response = await fetch(`${API_BASE_URL}/verify`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                    });

                    const result = await response.json();

                    if (response.ok) {
                        setUser(result.user);
                    } else if (result.error === "Token inválido o expirado") {
                        // Si el token expiró, intenta renovarlo
                        const { data: newSession, error: refreshError } =
                            await supabase.auth.refreshSession();

                        if (refreshError) {
                            console.error(
                                "Error renovando token:",
                                refreshError,
                            );
                            // Manejo adicional (cerrar sesión o redirigir al login)
                        } else if (newSession?.session) {
                            const newToken = newSession.session.access_token;
                            await SecureStore.setItemAsync(
                                "user_token",
                                newToken,
                            );

                            // Reintenta la verificación con el nuevo token
                            const retryResponse = await fetch(
                                `${API_BASE_URL}/verify`,
                                {
                                    method: "POST",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: `Bearer ${newToken}`,
                                    },
                                },
                            );

                            const retryResult = await retryResponse.json();
                            if (retryResponse.ok) {
                                setUser(retryResult.user);
                            } else {
                                console.error(
                                    "Error verificando con el nuevo token:",
                                    retryResult.error,
                                );
                            }
                        }
                    } else {
                        console.error("Error de autenticación:", result.error);
                    }
                } else {
                    const { data: { session } } = await supabase.auth
                        .getSession();
                    if (session?.user) {
                        setUser({
                            id: session.user.id,
                            nombre:
                                session.user.user_metadata?.name.split(
                                    " ",
                                )[0] || "Usuario",
                        });
                    }
                }
            } catch (error) {
                console.error("Error verificando sesión:", error);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const signOut = async () => {
        try {
            await SecureStore.deleteItemAsync("user_token");
            await supabase.auth.signOut();
            setUser(null);
        } catch (error) {
            console.error("Error cerrando sesión:", error);
        }
    };

    return { user, loading, signOut };
};
