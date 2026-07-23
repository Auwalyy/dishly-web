"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

export default function VerifyOTPPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "email_verification";
  const { user } = useAuthStore();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
    const timer = setInterval(() => setResendTimer((t) => (t > 0 ? t - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) setOtp(pasted.split(""));
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setError("Please enter the complete 6-digit code"); return; }
    setLoading(true);
    setError("");
    try {
      await axios.post("/api/auth/verify-otp", { otp: code, identifier: user?.email, type });
      router.push("/browse");
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      await axios.post("/api/auth/forgot-password", { email: user?.email });
      setResendTimer(60);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center">
          <div className="h-16 w-16 rounded-2xl bg-orange-100 dark:bg-orange-950 flex items-center justify-center mx-auto mb-6 text-3xl">📧</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Check your email</h1>
          <p className="text-gray-500 mb-8">
            We sent a 6-digit code to <strong className="text-gray-700 dark:text-gray-300">{user?.email}</strong>
          </p>

          {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-sm">{error}</div>}

          <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="h-14 w-12 text-center text-xl font-bold rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            ))}
          </div>

          <Button onClick={handleVerify} loading={loading} size="lg" className="w-full mb-4">Verify Code</Button>

          <p className="text-sm text-gray-500">
            Didn't receive the code?{" "}
            <button onClick={handleResend} disabled={resendTimer > 0}
              className="text-orange-500 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:text-orange-600">
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
