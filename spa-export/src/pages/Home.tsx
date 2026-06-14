import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="shell">
      <div className="card">
        <h1>GuideMe SPA</h1>
        <p className="sub">
          {email ? `Signed in as ${email}` : "Not signed in."}
        </p>
        {email ? (
          <>
            <Link className="link" to="/change-password">Change password</Link>
            <div style={{ height: 12 }} />
            <button className="primary" onClick={signOut}>Sign out</button>
          </>
        ) : (
          <>
            <Link className="link" to="/login">Log in</Link>
            <span style={{ margin: "0 8px" }}>·</span>
            <Link className="link" to="/register">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
