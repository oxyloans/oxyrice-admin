import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { saveSession } from "../auth";
import logo from "../../../assets/img/oxyglobal.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused, setFocused] = useState("");
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawFrame = (t) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Slow rotating soft blobs
      const angle = t * 0.00018;
      const bx1 = cx + Math.cos(angle) * 55;
      const by1 = cy + Math.sin(angle) * 30;
      const g1 = ctx.createRadialGradient(bx1, by1, 0, bx1, by1, 130);
      g1.addColorStop(0, "rgba(167,130,255,0.22)");
      g1.addColorStop(1, "rgba(167,130,255,0)");
      ctx.beginPath(); ctx.arc(bx1, by1, 130, 0, Math.PI * 2);
      ctx.fillStyle = g1; ctx.fill();

      const bx2 = cx + Math.cos(angle + 2.1) * 60;
      const by2 = cy + Math.sin(angle + 2.1) * 35;
      const g2 = ctx.createRadialGradient(bx2, by2, 0, bx2, by2, 110);
      g2.addColorStop(0, "rgba(255,180,210,0.18)");
      g2.addColorStop(1, "rgba(255,180,210,0)");
      ctx.beginPath(); ctx.arc(bx2, by2, 110, 0, Math.PI * 2);
      ctx.fillStyle = g2; ctx.fill();

      const bx3 = cx + Math.cos(angle + 4.2) * 50;
      const by3 = cy + Math.sin(angle + 4.2) * 28;
      const g3 = ctx.createRadialGradient(bx3, by3, 0, bx3, by3, 100);
      g3.addColorStop(0, "rgba(180,220,255,0.16)");
      g3.addColorStop(1, "rgba(180,220,255,0)");
      ctx.beginPath(); ctx.arc(bx3, by3, 100, 0, Math.PI * 2);
      ctx.fillStyle = g3; ctx.fill();

      animId = requestAnimationFrame(drawFrame);
    };

    animId = requestAnimationFrame(drawFrame);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("https://meta.oxyloans.com/api/user-service/userEmailPassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      const data = await res.json();
      if (data.status !== "Login Successful") throw new Error("Invalid credentials");
      saveSession(data);
      navigate("/superadmin/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden",
      background: "linear-gradient(135deg, #f0ecff 0%, #f7f0ff 30%, #fff0f6 65%, #f0f6ff 100%)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

        * { box-sizing: border-box; }

        .ceo-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 860px;
          margin: 24px;
          border-radius: 24px;
          overflow: hidden;
          display: flex;
          box-shadow:
            0 4px 6px rgba(0,0,0,0.04),
            0 20px 60px rgba(120,80,200,0.12),
            0 0 0 1px rgba(200,180,255,0.4);
          background: #fff;
        }

        .card-left {
          flex: 1;
          background: linear-gradient(150deg, #1a1228 0%, #0f1a2e 50%, #1a1228 100%);
          padding: 52px 44px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          min-height: 540px;
        }

        .card-left::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse at 30% 20%, rgba(147,100,255,0.25) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, rgba(255,120,180,0.15) 0%, transparent 55%),
            radial-gradient(ellipse at 60% 50%, rgba(80,140,255,0.1) 0%, transparent 50%);
        }

        .left-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .card-right {
          width: 380px;
          padding: 52px 44px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: #fff;
        }

        .access-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(147,100,255,0.12);
          border: 1px solid rgba(147,100,255,0.25);
          border-radius: 20px;
          padding: 5px 12px 5px 8px;
          width: fit-content;
          margin-bottom: 28px;
        }

        .badge-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #9364ff;
          box-shadow: 0 0 6px rgba(147,100,255,0.8);
          animation: pulse-badge 2s ease-in-out infinite;
        }

        @keyframes pulse-badge {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        .stat-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: auto;
        }

        .stat-box {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 16px;
        }

        .fi-input-wrap { position: relative; margin-bottom: 14px; }

        .fi-label {
          position: absolute;
          left: 15px; top: 50%;
          transform: translateY(-50%);
          font-size: 13px;
          color: #9ca3af;
          pointer-events: none;
          transition: all 0.18s ease;
          background: #fff;
          padding: 0 3px;
          font-family: 'Inter', sans-serif;
        }
        .fi-label.up {
          top: 0; font-size: 10px;
          color: #7c3aed;
          transform: translateY(-50%);
          font-weight: 500;
        }

        .fi-input {
          width: 100%;
          background: #fafafa;
          border: 1.5px solid #e5e7eb;
          border-radius: 11px;
          padding: 15px 15px;
          color: #111;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          font-family: 'Inter', sans-serif;
        }
        .fi-input:focus {
          border-color: #7c3aed;
          background: #fff;
          box-shadow: 0 0 0 3px rgba(124,58,237,0.08);
        }

        .eye-btn {
          position: absolute; right: 13px; top: 50%;
          transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: #9ca3af; padding: 4px; display: flex; align-items: center;
        }
        .eye-btn:hover { color: #7c3aed; }

        .ceo-btn {
          width: 100%; padding: 15px;
          border-radius: 11px; border: none; cursor: pointer;
          font-size: 14px; font-weight: 600;
          font-family: 'Inter', sans-serif;
          letter-spacing: 0.2px;
          background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
          color: #fff;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.35);
          position: relative; overflow: hidden;
        }
        .ceo-btn::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent);
        }
        .ceo-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 28px rgba(124,58,237,0.48);
        }
        .ceo-btn:active:not(:disabled) { transform: translateY(0); }
        .ceo-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        @keyframes spin { to { transform: rotate(360deg); } }

        @media (max-width: 700px) {
          .card-left { display: none; }
          .card-right { width: 100%; padding: 40px 28px; }
        }
      `}</style>

      {/* Full-page ambient canvas */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0 }} />

      {/* Centered card */}
      <div className="ceo-card">

        {/* ── Left: brand panel ── */}
        <div className="card-left">
          <div className="left-grid" />

          {/* Top section */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="access-badge">
              <div className="badge-dot" />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#c4b0ff", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Super Admin Portal
              </span>
            </div>
            <h2 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.5px" }}>
              OXY Global<br />Admin Console
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 240 }}>
              Restricted to authorised super administrators. All activity is audited and logged.
            </p>
          </div>

          {/* Decorative centre orb */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 0 }}>
            <div style={{
              width: 180, height: 180,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, rgba(180,140,255,0.25), rgba(90,50,180,0.1) 60%, transparent)",
              border: "1px solid rgba(147,100,255,0.15)",
            }} />
          </div>

          {/* Bottom stats */}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div className="stat-row">
              {[
                { v: "50+", l: "Employees" },
                { v: "42+", l: "Bank Partners" },
                { v: "4 Nations", l: "Global Presence" },
                { v: "12+ Years", l: "Market Leadership" },
              ].map(({ v, l }) => (
                <div className="stat-box" key={l}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#e9d5ff", marginBottom: 2 }}>{v}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 400 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: login form ── */}
        <div className="card-right">
          <img src={logo} alt="OxyGlobal" style={{ height: 72, marginBottom: 32, display: "block" }} />

          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0f0a1e", margin: "0 0 5px", letterSpacing: "-0.4px" }}>
              Super Admin Login
            </h1>
            <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, lineHeight: 1.6 }}>
              Restricted portal for platform administrators only.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="fi-input-wrap">
              <label className={`fi-label ${focused === "email" || email ? "up" : ""}`}>Email address</label>
              <input
                type="email"
                className="fi-input"
                value={email}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused("")}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="fi-input-wrap">
              <label className={`fi-label ${focused === "password" || password ? "up" : ""}`}>Password</label>
              <input
                type={showPass ? "text" : "password"}
                className="fi-input"
                value={password}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused("")}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingRight: 42 }}
                required
              />
              <button type="button" className="eye-btn" onClick={() => setShowPass(v => !v)} aria-label={showPass ? "Hide password" : "Show password"}>
                {showPass ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            </div>

            {error && (
              <div style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: 9,
                padding: "10px 13px",
                marginBottom: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <svg width="13" height="13" fill="none" stroke="#ef4444" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontSize: 12, color: "#dc2626" }}>{error}</span>
              </div>
            )}

            <button type="submit" className="ceo-btn" disabled={loading} style={{ marginTop: 6, background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", boxShadow: "0 4px 20px rgba(15,23,42,0.35)" }}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ animation: "spin 0.8s linear infinite" }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
                  </svg>
                  Authenticating…
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Login
                </span>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
}