import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoImage from "../../assets/img/OXYONE-mark.png";
import loginImage from "../../assets/img/loginpage.jpg";
import axios from "axios";
import BASE_URL from "../config/Config";

const MailIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M3 6.5C3 5.67 3.67 5 4.5 5h15c.83 0 1.5.67 1.5 1.5v11c0 .83-.67 1.5-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <path d="m4 6.5 8 6.2 8-6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LockIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2" stroke="currentColor" strokeWidth="1.6"/>
    <path d="M7.5 10.5V7.8a4.5 4.5 0 0 1 9 0v2.7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <circle cx="12" cy="15" r="1.6" fill="currentColor"/>
  </svg>
);

const EyeIcon = ({ off }) => off ? (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M10.6 5.2A10.4 10.4 0 0 1 12 5c5.5 0 9 5 9 7 0 .8-.62 2.1-1.8 3.4M6.5 6.6C4.2 8 3 10.3 3 12c0 2 3.5 7 9 7 1.4 0 2.7-.32 3.8-.86" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M9.9 10.1a2.5 2.5 0 0 0 3.9 3.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
) : (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M3 12s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.6"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
    <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

function Login() {
  const [email,    setEmail]    = useState(() => localStorage.getItem("admin_rememberedEmail") || "");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(() => !!localStorage.getItem("admin_rememberedEmail"));
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [ripples,  setRipples]  = useState([]);
  const btnRef   = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (
      localStorage.getItem("admin_uniquId") &&
      localStorage.getItem("admin_primaryType") &&
      localStorage.getItem("adminAccessToken")
    ) {
      navigate("/oxyone");
    }
  }, [navigate]);

  const addRipple = (e) => {
    const btn = btnRef.current;
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(rp => rp.id !== id)), 700);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sub = e.nativeEvent.submitter;
    addRipple(sub ? { clientX: sub.getBoundingClientRect().left + 40, clientY: sub.getBoundingClientRect().top + 20 } : { clientX: 0, clientY: 0 });
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/user-service/userEmailPassword`, { email, password }, { headers: { "Content-Type": "application/json" } });
      if (res.data.status === "Login Successful") {
        const { accessToken, token, refreshToke, refreshToken, id, primaryType, name } = res.data;
        if (primaryType === "HELPDESKSUPERADMIN" || primaryType === "HELPDESKADMIN") {
          localStorage.setItem("adminAccessToken", accessToken || token);
          if (refreshToke || refreshToken) localStorage.setItem("adminRefreshToken", refreshToke || refreshToken);
          localStorage.setItem("admin_uniquId", id);
          localStorage.setItem("admin_primaryType", primaryType);
          localStorage.setItem("admin_userName", name);
          remember ? localStorage.setItem("admin_rememberedEmail", email) : localStorage.removeItem("admin_rememberedEmail");
          const redirect = localStorage.getItem("redirectAfterLogin_oxyone") || "/oxyone";
          localStorage.removeItem("redirectAfterLogin_oxyone");
          navigate(redirect);
        } else {
          setError("You are not authorized to access the admin panel.");
          setLoading(false);
        }
      } else {
        setError(res.data.errorMessage || "Invalid email or password.");
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to login. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-y-auto overflow-x-hidden py-5 px-4"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Card */}
      <div className="flex w-full max-w-[660px] min-h-[420px] rounded-2xl overflow-hidden shadow-2xl"
        style={{ animation: "cardIn .7s cubic-bezier(.22,1,.36,1) both", boxShadow: "0 0 0 1px rgba(255,255,255,.06), 0 40px 100px rgba(0,0,0,.5)" }}>

        {/* Left Panel */}
        <div className="hidden sm:flex w-60 flex-shrink-0 relative overflow-hidden"
          style={{ minHeight: 420, backgroundImage: `url(${loginImage})`, backgroundSize: "120%", backgroundPosition: "center 20%" }}>
          <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(2,6,16,.15) 0%, rgba(2,6,16,.55) 100%)" }} />
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white flex items-start justify-center p-6 sm:p-7 relative overflow-y-auto overflow-x-hidden">
          <div className="absolute top-[-100px] right-[-100px] w-[350px] h-[350px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(29,78,216,.05), transparent 70%)" }} />
          <div className="absolute bottom-[-80px] left-[-60px] w-[280px] h-[280px] rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(5,150,105,.04), transparent 70%)" }} />

          <div className="w-full max-w-sm relative z-10" style={{ animation: "slideUp .65s .15s cubic-bezier(.22,1,.36,1) both" }}>
            {/* Head */}
            <div className="mb-5">
              <img src={logoImage} alt="OXYONE" className="h-8 w-auto object-contain mb-2.5 block max-w-[140px]" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Welcome back</h2>
              <p className="text-xs text-slate-500">Sign in to your admin account to continue</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {/* Email */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="oxy-email">Email address</label>
                <div className={`flex items-center rounded-xl border-[1.5px] transition-all ${email ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-50"} focus-within:border-blue-700 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(29,78,216,.08)]`}>
                  <span className="pl-3 text-slate-400 flex-shrink-0"><MailIcon /></span>
                  <input id="oxy-email" type="email" autoComplete="username" placeholder="you@company.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none px-2.5 py-2.5 text-slate-900 text-sm font-medium placeholder:text-slate-400 placeholder:font-normal" />
                </div>
              </div>

              {/* Password */}
              <div className="mb-1">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5" htmlFor="oxy-password">Password</label>
                <div className={`flex items-center rounded-xl border-[1.5px] transition-all ${password ? "border-slate-300 bg-white" : "border-slate-200 bg-slate-50"} focus-within:border-blue-700 focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(29,78,216,.08)]`}>
                  <span className="pl-3 text-slate-400 flex-shrink-0"><LockIcon /></span>
                  <input id="oxy-password" type={showPass ? "text" : "password"} autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none px-2.5 py-2.5 text-slate-900 text-sm font-medium placeholder:text-slate-400 placeholder:font-normal" />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                    className="px-3 h-full text-slate-400 hover:text-blue-700 transition-colors cursor-pointer bg-transparent border-none flex items-center">
                    <EyeIcon off={showPass} />
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center mt-1 mb-4">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-500 cursor-pointer select-none">
                  <input type="checkbox" className="sr-only" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  <span className={`w-4 h-4 rounded-[5px] flex-shrink-0 border-[1.5px] grid place-items-center transition-all ${remember ? "bg-blue-700 border-blue-700 text-white" : "border-slate-300 text-transparent"}`}>
                    <CheckIcon />
                  </span>
                  Remember me
                </label>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5 text-xs font-medium text-red-600 mb-3.5"
                  style={{ animation: "popIn .3s ease both" }} role="alert">
                  <span className="w-4 h-4 rounded-full flex-shrink-0 bg-red-100 text-red-600 grid place-items-center text-[10px] font-black">!</span>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button ref={btnRef} type="submit" disabled={loading}
                className="w-full border-none rounded-[9px] py-2.5 bg-white text-slate-900 text-sm font-bold cursor-pointer relative overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                style={{ boxShadow: "0 4px 16px rgba(15,23,42,.15)", border: "1.5px solid #e2e8f0" }}>
                <span className="absolute top-0 left-0 h-full w-2/5 pointer-events-none"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.15), transparent)", animation: "shine 3.6s ease-in-out infinite" }} />
                {ripples.map(r => (
                  <span key={r.id} className="absolute w-3 h-3 rounded-full pointer-events-none"
                    style={{ left: r.x, top: r.y, background: "rgba(255,255,255,.5)", animation: "ripple .7s ease-out" }} />
                ))}
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading
                    ? <span className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-900" style={{ animation: "spin .7s linear infinite" }} />
                    : <><span>Sign In</span><ArrowIcon /></>}
                </span>
              </button>
            </form>

            <div className="text-center mt-4 text-xs text-slate-400">
              Need access?{" "}
              <button type="button" className="text-blue-700 font-semibold bg-transparent border-none cursor-pointer hover:underline">
                Contact your administrator
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes cardIn { from { opacity: 0; transform: translateY(24px) scale(.97); } to { opacity: 1; transform: none; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        @keyframes popIn  { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: none; } }
        @keyframes shine  { 0%,100% { transform: translateX(-200%); } 50% { transform: translateX(400%); } }
        @keyframes ripple { from { transform: scale(0); opacity: 1; } to { transform: scale(18); opacity: 0; } }
        @keyframes spin   { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default Login;
