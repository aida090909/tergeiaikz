import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const navItems = [
  { path: '/', icon: 'dashboard', labelKey: 'nav.dashboard' },
  { path: '/cases', icon: 'folder_open', labelKey: 'nav.cases' },
  { path: '/create', icon: 'add_circle_outline', labelKey: 'nav.create' },
  { path: '/archive', icon: 'inventory_2', labelKey: 'nav.archive' },
  { path: '/history', icon: 'history', labelKey: 'nav.history' },
];

const adminItems = [
  { path: '/admin', icon: 'admin_panel_settings', labelKey: 'nav.admin_panel' },
];

export default function Layout() {
  const { user, t, lang, switchLang, logout } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const userName = lang === 'kz' ? (user?.full_name_kz || user?.full_name) : user?.full_name;
  const initials = userName ? userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'T';

  const closeSidebar = () => setSidebarOpen(false);

  const pageTitle = () => {
    const p = location.pathname;
    if (p === '/') return t('dashboard.title');
    if (p === '/cases') return t('cases.title');
    if (p.startsWith('/cases/')) return t('cases.title');
    if (p === '/create') return t('resolutions.title');
    if (p === '/archive') return t('archive.title');
    if (p === '/history') return t('history.title');
    if (p === '/admin') return t('admin.title');
    return t('app_name');
  };

  return (
    <div className="app-layout">
      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={closeSidebar} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">T</div>
          <div className="sidebar-logo-text">
            <h1>{t('app_name')}</h1>
            <span>{t('app_subtitle')}</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">{t('nav.main')}</div>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebar}
            >
              <span className="material-icons-outlined">{item.icon}</span>
              {t(item.labelKey)}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <div className="sidebar-section-title">{t('nav.admin')}</div>
              {adminItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={closeSidebar}
                >
                  <span className="material-icons-outlined">{item.icon}</span>
                  {t(item.labelKey)}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{userName}</div>
            <div className="sidebar-user-role">
              {user?.role === 'admin' ? t('nav.admin') : user?.rank || t('nav.investigators')}
            </div>
          </div>
          <button className="sidebar-logout" onClick={logout} title={t('nav.logout')}>
            <span className="material-icons-outlined">logout</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="app-main">
        {/* Header */}
        <header className="header">
          <button className="header-menu-btn" onClick={() => setSidebarOpen(true)}>
            <span className="material-icons-outlined">menu</span>
          </button>
          <h2 className="header-title">{pageTitle()}</h2>
          <div className="header-actions">
            <div className="lang-switcher">
              <button
                className={`lang-btn ${lang === 'kz' ? 'active' : ''}`}
                onClick={() => switchLang('kz')}
              >
                ҚАЗ
              </button>
              <button
                className={`lang-btn ${lang === 'ru' ? 'active' : ''}`}
                onClick={() => switchLang('ru')}
              >
                РУС
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      {/* Bottom Nav (Mobile) */}
      <nav className="bottom-nav">
        {navItems.slice(0, 5).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="material-icons-outlined">{item.icon}</span>
            <span>{t(item.labelKey)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
