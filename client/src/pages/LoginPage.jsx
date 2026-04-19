import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function LoginPage() {
  const { t, lang, switchLang, login } = useApp();
  const [iin, setIin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotIin, setForgotIin] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  useEffect(() => {
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

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (forgotIin.length !== 12) return;
    setForgotSent(true);
  };

  const closeForgot = () => {
    setShowForgot(false);
    setForgotIin('');
    setForgotSent(false);
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

        <div style={{textAlign:'center', marginTop:16}}>
          <button
            className="login-forgot-btn"
            onClick={() => setShowForgot(true)}
            id="forgot-password-btn"
            type="button"
          >
            {t('login.forgot_password')}
          </button>
        </div>

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

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="modal-overlay" onClick={closeForgot}>
          <div className="modal" style={{maxWidth:400}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <span className="material-icons-outlined" style={{verticalAlign:'middle', marginRight:8, color:'var(--primary)'}}>lock_reset</span>
                {t('login.forgot_title')}
              </h3>
              <button className="modal-close" onClick={closeForgot}>
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              {forgotSent ? (
                <div style={{textAlign:'center', padding:'16px 0'}}>
                  <div style={{
                    width:64, height:64, borderRadius:'50%',
                    background:'rgba(0,196,140,0.1)', color:'var(--accent-green)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    margin:'0 auto 16px', fontSize:32
                  }}>
                    <span className="material-icons-outlined">check_circle</span>
                  </div>
                  <p style={{color:'var(--text-primary)', fontWeight:500, marginBottom:8}}>
                    {t('login.forgot_success')}
                  </p>
                  <button
                    className="btn btn-primary"
                    style={{marginTop:16}}
                    onClick={closeForgot}
                  >
                    {t('login.back_to_login')}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotSubmit}>
                  <p style={{fontSize:'var(--font-sm)', color:'var(--text-secondary)', marginBottom:20}}>
                    {t('login.forgot_desc')}
                  </p>
                  <div className="form-group">
                    <label className="form-label">{t('login.forgot_iin_label')}</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder={t('login.iin_placeholder')}
                      value={forgotIin}
                      onChange={e => setForgotIin(e.target.value.replace(/\D/g,'').slice(0,12))}
                      maxLength={12}
                      required
                      id="forgot-iin-input"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    disabled={forgotIin.length !== 12}
                    id="forgot-submit-btn"
                  >
                    <span className="material-icons-outlined" style={{fontSize:18}}>send</span>
                    {t('login.forgot_submit')}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
