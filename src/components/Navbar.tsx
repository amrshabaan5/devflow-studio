import { useState } from "react";

interface NavbarProps {
  theme: "dark" | "light";
  setTheme: (theme: "dark" | "light") => void;
  lang: "en" | "ar";
  setLang: (lang: "en" | "ar") => void;
  onExport?: () => void;
  onImportClick?: () => void;
}

export function Navbar({
  theme,
  setTheme,
  lang,
  setLang,
  onExport,
  onImportClick,
}: NavbarProps) {
  const [notificationsCount, setNotificationsCount] = useState(3);

  return (
    <nav className="main-navbar">
      {/* الجزء الأيسر: اللوجو واسم المشروع */}
      <div className="nav-brand">
        <div className="nav-logo">DF</div>
        <div className="nav-title-group">
          <span className="nav-project-name">DevFlow Studio</span>
          <span className="nav-status-badge">v2.0 Pro</span>
        </div>
      </div>

      {/* الجزء الأيمن: الأدوات، الإشعارات، والمستخدم */}
      <div className="nav-actions">
        <button className="nav-icon-btn" onClick={() => setLang(lang === "en" ? "ar" : "en")} title="Change Language">
          🌐 {lang === "en" ? "العربية" : "English"}
        </button>

        <button className="nav-icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Toggle Theme">
          {theme === "dark" ? "☀️" : "🌙"}
        </button>

        {onExport && (
          <button className="nav-text-btn export-style" onClick={onExport}>
            📥 {lang === "ar" ? "تصدير" : "Export"}
          </button>
        )}
        
        {onImportClick && (
          <button className="nav-text-btn import-style" onClick={onImportClick}>
            📤 {lang === "ar" ? "استيراد" : "Import"}
          </button>
        )}

        <hr className="nav-divider" />

        {/* الإشعارات */}
        <div className="nav-notification-box" onClick={() => setNotificationsCount(0)}>
          <span className="nav-bell">🔔</span>
          {notificationsCount > 0 && (
            <span className="notification-badge">{notificationsCount}</span>
          )}
        </div>

        {/* بروفايل المستخدم */}
        <div className="nav-user-profile">
          <img 
            src="https://api.dicebear.com/7.x/bottts/svg?seed=Ahmed" 
            alt="User Avatar" 
            className="nav-avatar"
          />
          <div className="nav-user-info">
            <span className="nav-username">Ahmed Dev</span>
            <span className="nav-role">Lead Engineer</span>
          </div>
        </div>
      </div>
    </nav>
  );
}