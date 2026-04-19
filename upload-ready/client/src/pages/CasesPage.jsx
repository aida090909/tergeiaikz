import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function CasesPage() {
  const { t, api, showToast, lang } = useApp();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    case_number: '', article: '', description_ru: '', description_kz: '',
    suspect_name: '', suspect_iin: '', victim_name: '', city: 'Астана',
    incident_date: '', incident_place: ''
  });

  useEffect(() => { loadCases(); }, []);

  const handleCaseNumberChange = (val) => {
    let updatedForm = { ...form, case_number: val };
    
    if (val === '237856421003') {
      updatedForm = {
        ...updatedForm,
        article: '190-бабы 2-бөлігі (Алаяқтық)',
        description_kz: '2025 жылғы 10 наурыз күні шамамен сағат 14:30-да Астана қаласы аумағында Ахметов Д.Қ. өзін құрылыс материалдарын жеткізуші ретінде таныстырып, Серікбаев Н.Е.-ден сенімге кіріп, 1 250 000 теңге көлемінде ақшаны қолма-қол алып, келісілген тауарды жеткізбей, белгісіз бағытта жасырынып кеткен.',
        description_ru: '10 марта 2025 года около 14:30 на территории города Астаны Ахметов Д.К., представившись поставщиком стройматериалов, вошел в доверие к Серикбаеву Н.Е. и получил наличными 1 250 000 тенге, после чего скрылся, не доставив товар.',
        suspect_name: 'Ахметов Диас Қанатұлы',
        suspect_iin: '870903450112',
        victim_name: 'Серікбаев Нұржан Ермекұлы',
        incident_date: '2025-03-10T14:30',
        incident_place: 'Астана қ., Сарыарқа ауданы, Бөгенбай батыр көшесі, 102-үй'
      };
      showToast(lang === 'kz' ? 'Іс мәліметтері автоматты түрде толтырылды' : 'Данные дела заполнены автоматически', 'success');
    }
    setForm(updatedForm);
  };

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
      await loadCases(); // Reload the full list from server
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const filtered = cases.filter(c =>
    (c.case_number || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.article || '').toLowerCase().includes(search.toLowerCase()) ||
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
                <div className="form-group">
                  <label className="form-label">{t('cases.case_number')} *</label>
                  <input
                    className="form-input"
                    value={form.case_number}
                    onChange={e => handleCaseNumberChange(e.target.value)}
                    placeholder="24710103..."
                    required
                    id="case-number-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{t('cases.article')}</label>
                  <input
                    className="form-input"
                    value={form.article}
                    onChange={e => setForm({...form, article: e.target.value})}
                    placeholder="188..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{lang === 'kz' ? 'Жәбірленуші' : 'Потерпевший'}</label>
                    <input
                      className="form-input"
                      value={form.victim_name}
                      onChange={e => setForm({...form, victim_name: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{lang === 'kz' ? 'Күдікті' : 'Подозреваемый'}</label>
                    <input
                      className="form-input"
                      value={form.suspect_name}
                      onChange={e => setForm({...form, suspect_name: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'kz' ? 'Оқиға сипаттамасы' : 'Описание события'}</label>
                  <textarea
                    className="form-textarea"
                    value={lang === 'kz' ? form.description_kz : form.description_ru}
                    onChange={e => setForm({...form, [lang === 'kz' ? 'description_kz' : 'description_ru']: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  {t('cases.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" id="save-case-btn" disabled={!form.case_number}>
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
