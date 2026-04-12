import { createContext, useContext, useState, useEffect } from 'react';
import kz from '../i18n/kz.json';
import ru from '../i18n/ru.json';

const translations = { kz, ru };

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tergeu_token') || null);
  const [lang, setLang] = useState(localStorage.getItem('tergeu_lang') || 'kz');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[lang];
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        return key;
      }
    }
    return value;
  };

  const switchLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('tergeu_lang', newLang);
  };

  const login = async (iin, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ iin, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('tergeu_token', data.token);
    if (data.user.language_pref) {
      switchLang(data.user.language_pref);
    }
    return data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('tergeu_token');
  };

  const api = async (url, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      logout();
      throw new Error('Unauthorized');
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const apiDownload = async (url, filename) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (token) {
      api('/api/auth/me')
        .then(data => { setUser(data.user); setLoading(false); })
        .catch(() => { logout(); setLoading(false); });
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AppContext.Provider value={{
      user, token, lang, loading, toast,
      t, switchLang, login, logout, api, apiDownload, showToast
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
