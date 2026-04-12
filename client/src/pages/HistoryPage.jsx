import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function HistoryPage() {
  const { t, api, lang } = useApp();
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api('/api/resolutions')
      .then(data => { setResolutions(data.resolutions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const groupByDate = (items) => {
    const groups = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const weekAgo = new Date(Date.now() - 7 * 86400000);

    items.forEach(item => {
      const d = new Date(item.created_at);
      const ds = d.toDateString();
      let label;
      if (ds === today) label = t('history.today');
      else if (ds === yesterday) label = t('history.yesterday');
      else if (d > weekAgo) label = t('history.this_week');
      else label = t('history.earlier');

      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });
    return groups;
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const grouped = groupByDate(resolutions);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('history.title')}</h1>
      </div>

      {resolutions.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="material-icons-outlined">history</span>
            </div>
            <div className="empty-state-title">{t('common.no_data')}</div>
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([label, items]) => (
          <div key={label} style={{marginBottom:24}}>
            <h3 style={{fontSize:'var(--font-base)', fontWeight:600, color:'var(--text-secondary)', marginBottom:12, paddingLeft:4}}>
              {label}
            </h3>
            <div className="card">
              <div className="data-list">
                {items.map(r => (
                  <div key={r.id} className="data-list-item" style={{cursor:'default'}}>
                    <div className={`data-list-icon ${r.status === 'final' ? 'green' : 'gold'}`}>
                      <span className="material-icons-outlined">
                        {r.status === 'final' ? 'check_circle' : 'edit_note'}
                      </span>
                    </div>
                    <div className="data-list-content">
                      <div className="data-list-title">{r.resolution_type}</div>
                      <div className="data-list-sub">
                        № {r.case_number} • {r.language === 'kz' ? 'ҚАЗ' : 'РУС'}
                      </div>
                    </div>
                    <span className={`status-badge ${r.status}`}>
                      <span className="status-badge-dot"></span>
                      {r.status}
                    </span>
                    <div className="data-list-meta">
                      {new Date(r.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
