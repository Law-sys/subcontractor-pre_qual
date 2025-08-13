"use client";
import { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import TweetgarotLogo from "./TweetgarotLogo";
import SmartInput from "./SmartInput";
import { Mail, Lock, ArrowRight, LogOut } from "lucide-react";
import { mockAuth } from "../lib/auth/mockAuth";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setUser(mockAuth.currentUser);
    setLoading(false);
  }, []);

  const signIn = async () => {
    setError(""); setBusy(true);
    try {
      const res = await mockAuth.signInWithEmail(email, accessCode);
      setUser(res.user);
    } catch (e: any) {
      setError(e.message || "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  const signOut = async () => {
    await mockAuth.signOut();
    setUser(null); setEmail(""); setAccessCode(""); setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading Tweet/Garot Portal..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-8"><TweetgarotLogo size="full" /></div>
            <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--tg-primary-600)" }}>
              Subcontractor Portal
            </h2>
            <p className="leading-relaxed text-gray-600">
              Access with your email + access code. REAL OCR for COIs is active.
            </p>
          </div>

          <div className="space-y-6">
            <SmartInput label="Email Address" type="email" value={email} onChange={setEmail} placeholder="your-email@company.com" required icon={Mail} />
            <SmartInput label="Access Code" value={accessCode} onChange={(v)=>setAccessCode(v.toUpperCase())} placeholder="Enter access code" required icon={Lock} />
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-red-800">{error}</div>
            )}
            <button
              onClick={signIn}
              disabled={busy || !email || !accessCode}
              className="w-full text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-xl disabled:opacity-50"
              style={{ backgroundColor: "var(--tg-primary-600)" }}
            >
              {busy ? "Signing In…" : <span className="flex items-center justify-center">Access Portal<ArrowRight className="w-5 h-5 ml-2" /></span>}
            </button>
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700 space-y-1">
            <div><strong>Admin:</strong> admin@tweetgarot.com</div>
            <div><strong>Contractor:</strong> contractor@example.com</div>
            <div><strong>Access Code:</strong> 12345</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-8 py-4">
          <TweetgarotLogo size="md" isHeader />
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">{user.email}</div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${user.isAdmin ? "text-white" : "bg-gray-100 text-gray-800"}`}
                    style={user.isAdmin ? { backgroundColor: "var(--tg-primary-600)" } : {}}>
                {user.isAdmin ? "Administrator" : "Contractor"}
              </span>
            </div>
            <button onClick={signOut} className="flex items-center px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:shadow">
              <LogOut className="w-4 h-4 mr-2" /> Sign Out
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto">{children}</div>
    </div>
  );
}
