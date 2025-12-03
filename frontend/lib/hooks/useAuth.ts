"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "../types/auth";
import { useRouter } from "next/navigation";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data: AuthResponse) => {
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        const user: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          dni: data.dni,
          role: data.role,
        };
        localStorage.setItem("user", JSON.stringify(user));
        queryClient.setQueryData(["user"], user);
        router.push("/");
      }
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data: AuthResponse) => {
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        const user: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          dni: data.dni,
          role: data.role,
        };
        localStorage.setItem("user", JSON.stringify(user));
        queryClient.setQueryData(["user"], user);
        router.push("/");
      }
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    queryClient.setQueryData(["user"], null);
    queryClient.clear();
    router.push("/");
  };
}

export function useUser(): User | null {
  if (globalThis.window === undefined) return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as User;
  } catch {
    return null;
  }
}
