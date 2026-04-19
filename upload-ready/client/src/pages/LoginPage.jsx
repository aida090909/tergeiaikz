import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function LoginPage() {
  const { t, lang, switchLang, login } = useApp();
  const [iin, setIin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    // Force clear any ghost sessions when landing on the login page
    localStorage.removeItem('tergeu_token');
    localStorage.removeItem('tergeu_demo_user');
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(iin, password);
    } catch (err) {
      setError(err.message || t('login.error'));
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo-container">
            <img src="/assets/logo.png" alt="Logo" className="login-logo-img" />
          </div>
          <h2>{t('app_name')}</h2>
          <p>{t('app_subtitle')}</p>
        </div>

        {error && (
          <div className="login-error">
            <span className="material-icons-outlined" style={{fontSize:18}}>error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('login.iin')}</label>
            <input
              type="text"
              className="form-input"
              placeholder={t('login.iin_placeholder')}
              value={iin}
              onChange={e => setIin(e.target.value.replace(/\D/g, '').slice(0, 12))}
              maxLength={12}
              required
              id="login-iin"
            />
          </div>

          <div className="form-group">
            <label className="form-label">{t('login.password')}</label>
            <input
              type="password"
              className="form-input"
              placeholder={t('login.password_placeholder')}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              id="login-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loading || iin.length !== 12 || !password}
            id="login-submit"
          >
            {loading ? (
              <span className="spinner" style={{width:20,height:20,borderWidth:2}}></span>
            ) : (
              <>
                <span className="material-icons-outlined" style={{fontSize:20}}>login</span>
                {t('login.submit')}
              </>
            )}
          </button>
        </form>

        <div className="login-lang">
          <div className="lang-switcher">
            <button
              className={`lang-btn ${lang === 'kz' ? 'active' : ''}`}
              onClick={() => switchLang('kz')}
            >
              Қазақша
            </button>
            <button
              className={`lang-btn ${lang === 'ru' ? 'active' : ''}`}
              onClick={() => switchLang('ru')}
            >
              Русский
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
