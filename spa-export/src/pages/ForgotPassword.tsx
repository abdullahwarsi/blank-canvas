import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return setErr(error.message);
    setMsg("If that email exists, a reset link has been sent.");
  };

  return (
    <div className="shell">
      <form className="card" onSubmit={onSubmit}>
        <h1>Forgot password</h1>
        <p className="sub">Enter your email and we'll send a reset link.</p>
        {err && <div className="alert error">{err}</div>}
        {msg && <div className="alert success">{msg}</div>}
        <label>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <button className="primary" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</button>
        <p className="foot">
          <Link className="link" to="/login">Back to login</Link>
        </p>
      </form>
    </div>
  );
}
