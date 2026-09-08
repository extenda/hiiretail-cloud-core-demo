import { useState, type ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useSelectedApp } from "../hooks/useSelectedApp";

interface NavEntry {
  to: string;
  label: string;
  icon: ReactNode;
}

const ModulesIcon = (
  <path d="M4 4.5h5v5H4v-5Zm7 0h5v5h-5v-5ZM4 11.5h5v5H4v-5Zm7 0h5v5h-5v-5Z" />
);

const TranslationsIcon = (
  <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h5A1.5 1.5 0 0 1 12 5.5v9A1.5 1.5 0 0 0 10.5 13h-5A1.5 1.5 0 0 1 4 11.5v-6Zm8 0A1.5 1.5 0 0 1 13.5 4h1A1.5 1.5 0 0 1 16 5.5v6A1.5 1.5 0 0 1 14.5 13h-1" />
);

const KeyIcon = (
  <path d="M12.5 3.5a4 4 0 1 0-3.8 5.2L4 13.4V16h2.6l.9-.9v-1.3h1.3l.9-.9v-1.3h1.3l1-1a4 4 0 0 0 .5-7.1Z" />
);

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
  const [selectedModuleId] = useSelectedApp();

  const NAV: NavEntry[] = [
    { to: "/", label: "Apps", icon: ModulesIcon },
    {
      to: `/translations/${selectedModuleId}`,
      label: "Translations",
      icon: TranslationsIcon,
    },
    { to: "/tokens", label: "Tokens", icon: KeyIcon },
  ];

  return (
    <nav
      className={`flex shrink-0 flex-col border-r border-stone-200 bg-white transition-[width] duration-150 ${
        collapsed ? "w-14" : "w-56"
      }`}
    >
      {!collapsed && (
        <p className="px-2.5 pt-4 pb-1 text-[10px] font-semibold tracking-wider text-stone-500 uppercase">
          Translations
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
