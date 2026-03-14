"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/lib/axios";

const signupSchema = z.object({
  email: z.string().email("Pls enter the correct Email..!"),
  password: z.string().min(8, "Password should be minmum 8 chars..!"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords not match..!",
  path: ["confirmPassword"],
});

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await api.post("/signup", {
        email: data.email,
        password: data.password
      });
      
      alert("Account created! pls login.");
      router.push("/login");
    } catch (err: any) {
      alert("Signup fail: " + (err.response?.data?.detail || "Someting went wrong..!"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight italic">Create <span className="text-blue-500">Account</span></h2>
          <p className="text-zinc-500 text-sm">Join the community of lifelong learners</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-zinc-400">Email Address</label>
            <input 
              {...register("email")}
              className="w-full mt-1.5 p-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{String(errors.email.message)}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400">Password</label>
            <input 
              type="password"
              {...register("password")}
              className="w-full mt-1.5 p-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{String(errors.password.message)}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-400">Confirm Password</label>
            <input 
              type="password"
              {...register("confirmPassword")}
              className="w-full mt-1.5 p-3 bg-zinc-800 border border-zinc-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{String(errors.confirmPassword.message)}</p>}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "Pls Wait..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-zinc-500">
          Already a member?{" "}
          <Link href="/login" className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}