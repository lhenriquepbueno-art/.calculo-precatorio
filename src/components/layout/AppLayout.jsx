import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FilePlus, Database, Scale, FileText, 
  Shield, ChevronLeft, ChevronRight, LogOut, Bot, Menu, X, Layers
} from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/consolidado', icon: Layers, label: 'Cálculo Consolidado' },
  { path: '/cadastro', icon: FilePlus, label: 'Novo Precatório' },
  { path: '/indices', icon: Database, label: 'Banco de Índices' },
  { path: '/assistente', icon: Bot, label: 'IA Jurídica' },
  { path: '/auditoria', icon: Shield, label: 'Auditoria' },
];

export default function AppLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  return (
    <div className="dark min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full z-50 flex flex-col
        bg-sidebar border-r border-sidebar-border
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Scale className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-sidebar-foreground tracking-tight">Precatório SP</h1>
                <p className="text-[10px] text-sidebar-foreground/50 font-medium tracking-widest uppercase">AI Platform</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto">
              <Scale className="w-4 h-4 text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-blue-500/20' 
                    : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-4.5 h-4.5 shrink-0" style={{ width: 18, height: 18 }} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-2 border-t border-sidebar-border space-y-1">
          <button
            onClick={handleLogout}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full
              text-sidebar-foreground/50 hover:text-red-400 hover:bg-sidebar-accent transition-all
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sair</span>}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-full py-2 text-sidebar-foreground/30 hover:text-sidebar-foreground/60 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 transition-all duration-300 ${collapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        {/* Mobile header */}
        <header className="lg:hidden h-14 flex items-center px-4 border-b border-border glass sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 text-foreground/70">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 ml-3">
            <Scale className="w-4 h-4 text-blue-400" />
            <span className="font-bold text-sm">Precatório SP AI</span>
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}