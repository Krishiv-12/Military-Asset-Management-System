import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { NAV_ITEMS, ROLE_LABELS } from "../constants/roles.js";
import { Button } from "../components/FormControls.jsx";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 md:grid md:grid-cols-[240px_1fr]">
      <aside className={`${open ? "block" : "hidden"} md:block bg-navy-950 text-slate-200`}>
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <div>
            <p className="text-xs tracking-[0.2em] text-accent">MAMS</p>
            <p className="text-sm font-semibold text-white">Asset Command</p>
          </div>
        </div>
        <nav className="flex flex-col p-3" aria-label="Primary">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm ${isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
          <button
            type="button"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm md:hidden"
            onClick={() => setOpen((value) => !value)}
            aria-label="Toggle navigation"
          >
            Menu
          </button>
          <div className="hidden text-sm text-slate-500 md:block">Military Asset Management System</div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">
                {ROLE_LABELS[user.role]}
                {user.base ? ` · ${user.base.code}` : ""}
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
