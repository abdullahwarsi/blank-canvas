import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// For signed-in users who want to change their password from inside the app.
// Requires an active session.
export default function ChangePassword() {
  const navigate = useNavigate();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [current, setCurrent] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user));
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (password.length < 8) return setErr("Password must be at least 8 characters.");
    if (password !== confirm) return setErr("Passwords do not match.");
    setLoading(true);

    // Reauthenticate with current password to be safe.
    const { data: userData } = await supabase.auth.getUser();
    const email = userData.user?.email;
    if (email) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: current,
      });
      if (signInError) {
        setLoading(false);
        return setErr("Current password is incorrect.");
      }
    }

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return setErr(error.message);
    setMsg("Password changed successfully.");
    setCurrent(""); setPassword(""); setConfirm("");
  };

  if (authed === false) {
    return (
      <div className="shell">
        <div className="card">
          <h1>Change password</h1>
          <p className="sub">You need to be signed in to change your password.</p>
          <button className="primary" onClick={() => navigate("/login")}>Go to login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="shell">
      <form className="card" onSubmit={onSubmit}>
        <h1>Change password</h1>
        <p className="sub">Update your account password.</p>
        {err && <div className="alert error">{err}</div>}
        {msg && <div className="alert success">{msg}</div>}
        <label>Current password</label>
        <input type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
        <label>New password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <label>Confirm new password</label>
        <input type="password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        <button className="primary" disabled={loading}>{loading ? "Saving…" : "Update password"}</button>
        <p className="foot"><Link className="link" to="/">Back home</Link></p>
      </form>
    </div>
  );
}
