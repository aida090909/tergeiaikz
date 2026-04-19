import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function DashboardPage() {
  const { user, t, lang, api } = useApp();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [casesData, resData] = await Promise.all([
        api('/api/cases'),
        api('/api/resolutions')
      ]);
      setCases(casesData.cases || []);
      setResolutions(resData.resolutions || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const userName = lang === 'kz' ? (user?.full_name_kz || user?.full_name) : user?.full_name;
  const activeCases = cases.filter(c => c.status === 'active');

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      {/* Welcome */}
      <div style={{marginBottom: 24}}>
        <h2 style={{fontSize: 'var(--font-xl)', fontWeight: 600, color: 'var(--text-primary)'}}>
          {t('dashboard.welcome')}, {userName?.split(' ')[0]}! 👋
        </h2>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/cases')} style={{cursor:'pointer'}}>
          <div className="stat-card-icon blue">
            <span className="material-icons-outlined">folder_open</span>
          </div>
          <div>
            <div className="stat-card-value">{cases.length}</div>
            <div className="stat-card-label">{t('dashboard.total_cases')}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon green">
            <span className="material-icons-outlined">verified</span>
          </div>
          <div>
            <div className="stat-card-value">{activeCases.length}</div>
            <div className="stat-card-label">{t('dashboard.active_cases')}</div>
          </div>
        </div>
      </div>

      {/* Quick Action Banners */}
      <div className="banner-cards">
        <div className="banner-card blue" onClick={() => navigate('/cases')} style={{flex:1}}>
          <div className="banner-card-icon">
            <span className="material-icons-outlined">folder</span>
          </div>
          <div className="banner-card-title">{t('nav.cases')}</div>
          <div className="banner-card-count">{cases.length} {t('dashboard.total_cases').toLowerCase()}</div>
        </div>
        <div className="banner-card gold" onClick={() => navigate('/create-protocol')} style={{flex:1}}>
          <div className="banner-card-icon">
            <span className="material-icons-outlined">history_edu</span>
          </div>
          <div className="banner-card-title">{t('dashboard.create_protocol')}</div>
          <div className="banner-card-count">20+ {t('archive.protocols').toLowerCase()}</div>
        </div>
        <div className="banner-card teal" onClick={() => navigate('/create')} style={{flex:1}}>
          <div className="banner-card-icon">
            <span className="material-icons-outlined">auto_fix_high</span>
          </div>
          <div className="banner-card-title">{t('dashboard.create_resolution')}</div>
          <div className="banner-card-count">{resolutions.length} {t('dashboard.total_resolutions').toLowerCase()}</div>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="card" style={{marginBottom: 24}}>
        <div className="card-header">
          <div>
            <div className="card-title">{t('dashboard.my_cases')}</div>
          </div>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/cases')}>
            <span className="material-icons-outlined" style={{fontSize:16}}>arrow_forward</span>
          </button>
        </div>

        {cases.length === 0 ? (
          <div className="empty-state" style={{padding: 30}}>
            <div className="empty-state-icon">
              <span className="material-icons-outlined">folder_off</span>
            </div>
            <div className="empty-state-title">{t('dashboard.no_cases')}</div>
            <div className="empty-state-text">{t('dashboard.no_cases_desc')}</div>
            <button className="btn btn-primary" onClick={() => navigate('/cases')}>
              <span className="material-icons-outlined" style={{fontSize:18}}>add</span>
              {t('dashboard.create_case')}
            </button>
          </div>
        ) : (
          <div className="data-list">
            {cases.slice(0, 5).map(c => (
              <div key={c.id} className="data-list-item" onClick={() => navigate(`/cases/${c.id}`)}>
                <div className="data-list-icon blue">
                  <span className="material-icons-outlined">folder</span>
                </div>
                <div className="data-list-content">
                  <div className="data-list-title">№ {c.case_number}</div>
                  <div className="data-list-sub">{t('cases.article')}: {c.article}</div>
                </div>
                <div>
                  <span className={`status-badge ${c.status}`}>
                    <span className="status-badge-dot"></span>
                    {t(`cases.status_${c.status}`)}
                  </span>
                </div>
                <div className="data-list-meta">
                  <span className="material-icons-outlined" style={{fontSize:14}}>description</span>
                  {' '}{c.resolution_count || 0}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Resolutions */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">{t('dashboard.recent_resolutions')}</div>
          <button className="btn btn-sm btn-secondary" onClick={() => navigate('/archive')}>
            <span className="material-icons-outlined" style={{fontSize:16}}>arrow_forward</span>
          </button>
        </div>
        {resolutions.length === 0 ? (
          <div style={{textAlign:'center', padding:20, color:'var(--text-muted)', fontSize:'var(--font-sm)'}}>
            {t('dashboard.no_resolutions')}
          </div>
        ) : (
          <div className="data-list">
            {resolutions.slice(0, 5).map(r => (
              <div key={r.id} className="data-list-item" onClick={() => navigate('/archive')}>
                <div className="data-list-icon green">
                  <span className="material-icons-outlined">description</span>
                </div>
                <div className="data-list-content">
                  <div className="data-list-title">{r.resolution_type}</div>
                  <div className="data-list-sub">№ {r.case_number}</div>
                </div>
                <span className={`status-badge ${r.status}`}>
                  <span className="status-badge-dot"></span>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
