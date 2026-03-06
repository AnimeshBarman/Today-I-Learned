"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/lib/axios";
import { useAuthStore } from "@/store/useAuthStore";

const loginSchema = z.object({
  username: z.string().email("Enter correct email..!"),
  password: z.string().min(8, "Password should be minimum 8 character..!"),
});

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);


  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  // 3. Submit Logic
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // Swagger compatibility ke liye FormData bhej rahe hain
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("password", data.password);

      const res = await api.post("/login", formData);
      
      // Zustand store mein tokens save karna
      setAuth(res.data.access_token, res.data.refresh_token);
      
      // Dashboard par bhejna
      router.push("/dashboard");
    } catch (err: any) {
      alert("Login failed: " + (err.response?.data?.detail || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center tracking-tight">Login</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input 
              {...register("username")}
              className="w-full mt-1 p-2 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="example@gmail.com"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{String(errors.username.message)}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Password</label>
            <input 
              type="password"
              {...register("password")}
              className="w-full mt-1 p-2 bg-zinc-800 border border-zinc-700 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{String(errors.password.message)}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded font-semibold transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Rukiye..." : "Login Karein"}
          </button>
        </form>
      </div>
    </div>
  );
}