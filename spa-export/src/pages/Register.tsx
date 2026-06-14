import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: { full_name: name },
      },
    });
    setLoading(false);
    if (error) return setErr(error.message);
    if (data.session) {
      navigate("/");
    } else {
      setMsg("Check your email to confirm your account.");
    }
  };

  return (
    <div className="shell">
      <form className="card" onSubmit={onSubmit}>
        <h1>Create your account</h1>
        <p className="sub">Join GuideMe in under a minute.</p>
        {err && <div className="alert error">{err}</div>}
        {msg && <div className="alert success">{msg}</div>}
        <label>Full name</label>
        <input required value={name} onChange={(e) => setName(e.target.value)} />
        <label>Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="primary" disabled={loading}>{loading ? "Creating…" : "Create account"}</button>
        <p className="foot">
          Already have an account? <Link className="link" to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
