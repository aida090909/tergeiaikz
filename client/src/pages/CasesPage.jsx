import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function CasesPage() {
  const { t, api, showToast } = useApp();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    case_number: '', article: '', description_ru: '', description_kz: '',
    suspect_name: '', suspect_iin: '', victim_name: '', city: '',
    incident_date: '', incident_place: ''
  });

  useEffect(() => { loadCases(); }, []);

  const loadCases = async () => {
    try {
      const data = await api('/api/cases');
      setCases(data.cases || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api('/api/cases', { method: 'POST', body: JSON.stringify(form) });
      showToast(t('common.success'), 'success');
      setShowModal(false);
      setForm({ case_number: '', article: '', description_ru: '', description_kz: '',
        suspect_name: '', suspect_iin: '', victim_name: '', city: '',
        incident_date: '', incident_place: '' });
      loadCases();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = cases.filter(c =>
    c.case_number.toLowerCase().includes(search.toLowerCase()) ||
    c.article.toLowerCase().includes(search.toLowerCase()) ||
    (c.suspect_name || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('cases.title')}</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="create-case-btn">
          <span className="material-icons-outlined" style={{fontSize:18}}>add</span>
          {t('cases.new_case')}
        </button>
      </div>

      <div className="search-bar">
        <span className="material-icons-outlined">search</span>
        <input
          type="text"
          placeholder={t('cases.search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="search-cases"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="material-icons-outlined">folder_off</span>
            </div>
            <div className="empty-state-title">{t('dashboard.no_cases')}</div>
            <div className="empty-state-text">{t('dashboard.no_cases_desc')}</div>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              <span className="material-icons-outlined" style={{fontSize:18}}>add</span>
              {t('cases.new_case')}
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="data-list">
            {filtered.map(c => (
              <div key={c.id} className="data-list-item" onClick={() => navigate(`/cases/${c.id}`)}>
                <div className="data-list-icon blue">
                  <span className="material-icons-outlined">folder</span>
                </div>
                <div className="data-list-content">
                  <div className="data-list-title">№ {c.case_number}</div>
                  <div className="data-list-sub">
                    {t('cases.article')}: {c.article}
                    {c.suspect_name && ` • ${c.suspect_name}`}
                  </div>
                </div>
                <span className={`status-badge ${c.status}`}>
                  <span className="status-badge-dot"></span>
                  {t(`cases.status_${c.status}`)}
                </span>
                <div className="data-list-meta">
                  {new Date(c.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Case Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('cases.new_case')}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('cases.case_number')} *</label>
                    <input className="form-input" value={form.case_number}
                      onChange={e => setForm({...form, case_number: e.target.value})}
                      placeholder="2024-001234" required id="case-number-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('cases.article')} *</label>
                    <input className="form-input" value={form.article}
                      onChange={e => setForm({...form, article: e.target.value})}
                      placeholder="188 ч.1" required id="case-article-input" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('cases.suspect')}</label>
                    <input className="form-input" value={form.suspect_name}
                      onChange={e => setForm({...form, suspect_name: e.target.value})}
                      placeholder="" id="suspect-name-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('cases.victim')}</label>
                    <input className="form-input" value={form.victim_name}
                      onChange={e => setForm({...form, victim_name: e.target.value})}
                      placeholder="" id="victim-name-input" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('cases.city')}</label>
                    <input className="form-input" value={form.city}
                      onChange={e => setForm({...form, city: e.target.value})}
                      placeholder="" id="city-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('cases.incident_date')}</label>
                    <input type="date" className="form-input" value={form.incident_date}
                      onChange={e => setForm({...form, incident_date: e.target.value})}
                      id="incident-date-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('cases.incident_place')}</label>
                  <input className="form-input" value={form.incident_place}
                    onChange={e => setForm({...form, incident_place: e.target.value})}
                    id="incident-place-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('cases.description')} (RU)</label>
                  <textarea className="form-textarea" value={form.description_ru}
                    onChange={e => setForm({...form, description_ru: e.target.value})}
                    rows="3" id="case-desc-ru" />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('cases.description')} (KZ)</label>
                  <textarea className="form-textarea" value={form.description_kz}
                    onChange={e => setForm({...form, description_kz: e.target.value})}
                    rows="3" id="case-desc-kz" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  {t('cases.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" id="save-case-btn">
                  <span className="material-icons-outlined" style={{fontSize:18}}>save</span>
                  {t('cases.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
