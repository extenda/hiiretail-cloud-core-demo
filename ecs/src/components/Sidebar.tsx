import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";

interface NavEntry {
  to: string;
  label: string;
  icon: ReactNode;
}

const CartIcon = (
  <path d="M3 4h2l2 8.5h8L17 6.5H6M8.5 16.5h.01M14.5 16.5h.01" />
);

const CatalogIcon = (
  <path d="M4.5 4.5h11v11h-11v-11Zm0 3.7h11m-11 3.6h11M8 4.5v11" />
);

const ProjectIcon = (
  <path d="M10 3.5 3.5 7v6L10 16.5 16.5 13V7L10 3.5Zm0 4.5v8.5M10 8l6.5-1M10 8 3.5 7" />
);

const NAV: NavEntry[] = [
  { to: "/", label: "Checkout", icon: CartIcon },
  { to: "/conditions", label: "Condition catalog", icon: CatalogIcon },
  { to: "/project-restrictions", label: "Project restrictions", icon: ProjectIcon },
];

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav
      className={`flex shrink-0 flex-col border-r border-stone-200 bg-white transition-[width] duration-150 ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {!collapsed && (
        <p className="px-2.5 pt-4 pb-1 text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
          Modules
        </p>
      )}

      <ul className={`flex flex-col gap-0.5 p-2 ${collapsed ? "pt-4" : "pt-1"}`}>
        {NAV.map((entry) => (
          <li key={entry.to}>
            <NavLink
              to={entry.to}
              end={entry.to === "/"}
              title={collapsed ? entry.label : undefined}
              className={({ isActive }) =>
                `flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-brand-50 font-medium text-brand-700"
                    : "text-stone-700 hover:bg-stone-100"
                }`
              }
            >
              <NavIcon>{entry.icon}</NavIcon>
              {!collapsed && <span className="truncate">{entry.label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="flex-1" />

      <button
        onClick={() => setCollapsed((value) => !value)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="flex h-8 items-center justify-center border-t border-stone-200 text-xs text-stone-400 hover:bg-stone-50 hover:text-stone-600"
      >
        {collapsed ? "»" : "«"}
      </button>
    </nav>
  );
}
