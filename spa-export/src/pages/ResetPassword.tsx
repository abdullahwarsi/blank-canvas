import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// Supabase sends users here with a recovery token in the URL hash.
// detectSessionInUrl (enabled on the client) auto-exchanges it for a session.
export default function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (password.length < 8) return setErr("Password must be at least 8 characters.");
    if (password !== confirm) return setErr("Passwords do not match.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setErr(error.message);
    setMsg("Password updated. Redirecting to login…");
    setTimeout(() => navigate("/login"), 1500);
  };

  return (
    <div className="shell">
      <form className="card" onSubmit={onSubmit}>
        <h1>Set a new password</h1>
        <p className="sub">
          {ready ? "Choose a strong password you haven't used before." : "Validating reset link…"}
        </p>
        {err && <div className="alert error">{err}</div>}
        {msg && <div className="alert success">{msg}</div>}
        <label>New password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <label>Confirm password</label>
        <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button className="primary" disabled={loading || !ready}>
          {loading ? "Updating…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
