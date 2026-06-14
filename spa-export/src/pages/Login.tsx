import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return setErr(error.message);
    navigate("/");
  };

  return (
    <div className="shell">
      <form className="card" onSubmit={onSubmit}>
        <h1>Welcome back</h1>
        <p className="sub">Log in to continue.</p>
        {err && <div className="alert error">{err}</div>}
        <label>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <div className="row">
          <label style={{ margin: 0 }}>Password</label>
          <Link className="link" to="/forgot-password">Forgot password?</Link>
        </div>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="primary" disabled={loading}>{loading ? "Signing in…" : "Log in"}</button>
        <p className="foot">
          New here? <Link className="link" to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
