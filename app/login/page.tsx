"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store/useStore";
import MaterialIcon from "@/components/icons/MaterialIcon";

export default function LoginPage() {
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const login = useStore((state) => state.login);
  const router = useRouter();

  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity || !password) return;
    
    const success = await login(identity, password);
    if (success) {
      router.push("/");
    } else {
      setError(true);
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
      errorTimeoutRef.current = setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="scanline-overlay" />
      
      <div className="relative z-10 w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-primary shadow-lg glow-sm">
              <MaterialIcon name="precision_manufacturing" className="text-3xl text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic glow-blue">KINETIC LEDGER</h1>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.3em] text-outline">Accesso Autorizzato</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 rounded-[2rem] border border-outline-variant/80 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-outline tracking-widest">Identificazione (Username)</label>
              <input
                type="text"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                placeholder="Matteo_Coach"
                className={`w-full rounded-2xl border ${error ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest px-4 py-3 font-bold placeholder:text-outline/30 transition-colors focus:border-blue-600 focus:outline-none`}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-outline tracking-widest">Codice Accesso (Password)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-2xl border ${error ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest px-4 py-3 font-bold placeholder:text-outline/30 transition-colors focus:border-blue-600 focus:outline-none`}
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-[10px] font-black text-error uppercase tracking-widest text-center animate-pulse">
              Accesso Negato: Credenziali Non Valide
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-2xl bg-primary py-4 text-sm font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all active:scale-[0.98] glow-sm hover:bg-blue-600"
          >
            Accedi al Sistema
          </button>
        </form>

        <div className="text-center">
          <p className="text-[9px] font-bold text-outline uppercase tracking-tighter opacity-50">
            Protocollo Stabile v2.4.0 | Crittografia Handshake Attiva
          </p>
        </div>
      </div>
    </div>
  );
}
