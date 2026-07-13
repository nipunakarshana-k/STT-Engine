"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bot, FileAudio, Lock, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Auto login after registration
      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!loginResponse.ok) {
        router.push("/login");
        return;
      }

      router.push("/workspace");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-sage/80 bg-paper/90 p-8 shadow-soft backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-fern text-paper shadow-soft">
              <FileAudio size={24} />
            </span>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-semibold text-ink">Create your account</h2>
          <p className="mt-2 text-center text-sm text-muted">
            Or{" "}
            <Link href="/login" className="font-semibold text-fern hover:text-moss">
              sign in to your existing account
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5" htmlFor="full-name">
                Full name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                  <User size={18} />
                </div>
                <input
                  id="full-name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-sage bg-canvas/40 py-2.5 pl-10 pr-3 text-sm text-ink placeholder-muted outline-none focus:border-fern focus:ring-1 focus:ring-fern"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5" htmlFor="email-address">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                  <Mail size={18} />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-sage bg-canvas/40 py-2.5 pl-10 pr-3 text-sm text-ink placeholder-muted outline-none focus:border-fern focus:ring-1 focus:ring-fern"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-sage bg-canvas/40 py-2.5 pl-10 pr-3 text-sm text-ink placeholder-muted outline-none focus:border-fern focus:ring-1 focus:ring-fern"
                  placeholder="Minimum 6 characters"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-lg bg-fern py-3 px-4 text-sm font-semibold text-paper shadow-soft transition hover:bg-[#285f3c] focus:outline-none disabled:bg-sage/50 disabled:text-muted"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
