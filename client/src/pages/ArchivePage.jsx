import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ArchivePage() {
  const { t, api, apiDownload, showToast, lang } = useApp();
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [docType, setDocType] = useState('resolution');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [filterDay, setFilterDay] = useState('');
  const [previewId, setPreviewId] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => { loadResolutions(); }, []);

  const loadResolutions = async () => {
    try {
      const data = await api('/api/resolutions');
      setResolutions(data.resolutions || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handlePreview = async (id) => {
    try {
      const data = await api(`/api/resolutions/${id}`);
      setPreviewData(data.resolution);
      setPreviewId(id);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDownload = async (id, format) => {
    try {
      await apiDownload(`/api/resolutions/${id}/download/${format}`, `resolution_${id}.${format}`);
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm(lang === 'kz' ? 'Жоюға сенімдісіз бе?' : 'Вы уверены, что хотите удалить?')) return;
    try {
      await api(`/api/resolutions/${id}`, { method: 'DELETE' });
      showToast(t('common.success'), 'success');
      setResolutions(resolutions.filter(r => r.id !== id));
      if (previewId === id) { setPreviewId(null); setPreviewData(null); }
    } catch (err) { showToast(err.message, 'error'); }
  };

  // Derive available years from data
  const allYears = [...new Set(resolutions.map(r => new Date(r.created_at).getFullYear()))].sort((a,b)=>b-a);

  const filtered = resolutions.filter(r => {
    const typeStr = (r.resolution_type || '').toLowerCase();
    const matchSearch = typeStr.includes(search.toLowerCase()) ||
      (r.case_number || '').toLowerCase().includes(search.toLowerCase());
    const isActuallyProtocol = typeStr.includes('хаттама') || typeStr.includes('протокол');
    const matchDocType = docType === 'resolution' ? !isActuallyProtocol : isActuallyProtocol;
    const d = new Date(r.created_at);
    const matchYear = !filterYear || d.getFullYear().toString() === filterYear;
    const matchMonth = !filterMonth || (d.getMonth() + 1).toString() === filterMonth;
    const matchDay = !filterDay || d.getDate().toString() === filterDay;
    return matchSearch && matchDocType && matchYear && matchMonth && matchDay;
  });

  const months = t('archive.months') || [];

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('archive.title')}</h1>
      </div>

      {/* Doc type tabs */}
      <div className="filter-tabs" style={{marginBottom:16}}>
        {['resolution', 'protocol'].map(type => (
          <button
            key={type}
            className={`filter-tab ${docType === type ? 'active' : ''}`}
            onClick={() => { setDocType(type); setFilterYear(''); setFilterMonth(''); setFilterDay(''); }}
          >
            <span className="material-icons-outlined" style={{fontSize:18, marginRight:6}}>
              {type === 'resolution' ? 'description' : 'history_edu'}
            </span>
            {type === 'resolution' ? t('archive.resolutions') : t('archive.protocols')}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="search-bar">
        <span className="material-icons-outlined">search</span>
        <input type="text" placeholder={t('archive.search')} value={search}
          onChange={e => setSearch(e.target.value)} id="search-archive" />
      </div>

      {/* Date filters */}
      <div style={{display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center'}}>
        {/* Year */}
        <select
          className="form-select"
          value={filterYear}
          onChange={e => { setFilterYear(e.target.value); setFilterMonth(''); setFilterDay(''); }}
          style={{maxWidth:130, padding:'9px 14px'}}
          id="filter-year"
        >
          <option value="">{t('archive.all_years')}</option>
          {allYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        {/* Month */}
        <select
          className="form-select"
          value={filterMonth}
          onChange={e => { setFilterMonth(e.target.value); setFilterDay(''); }}
          style={{maxWidth:160, padding:'9px 14px'}}
          disabled={!filterYear}
          id="filter-month"
        >
          <option value="">{t('archive.all_months')}</option>
          {Array.isArray(months) && months.map((mn, i) => (
            <option key={i+1} value={(i+1).toString()}>{mn}</option>
          ))}
        </select>

        {/* Day */}
        <select
          className="form-select"
          value={filterDay}
          onChange={e => setFilterDay(e.target.value)}
          style={{maxWidth:120, padding:'9px 14px'}}
          disabled={!filterMonth}
          id="filter-day"
        >
          <option value="">{t('archive.all_days')}</option>
          {Array.from({length:31}, (_,i) => i+1).map(d => (
            <option key={d} value={d.toString()}>{d}</option>
          ))}
        </select>

        {/* Reset filters */}
        {(filterYear || filterMonth || filterDay) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => { setFilterYear(''); setFilterMonth(''); setFilterDay(''); }}
          >
            <span className="material-icons-outlined" style={{fontSize:16}}>clear</span>
            {lang === 'kz' ? 'Тазалау' : 'Сбросить'}
          </button>
        )}
      </div>

      {/* Active filter label */}
      {(filterYear || filterMonth || filterDay) && (
        <div style={{
          display:'flex', alignItems:'center', gap:8, marginBottom:12,
          fontSize:'var(--font-sm)', color:'var(--primary)', fontWeight:500
        }}>
          <span className="material-icons-outlined" style={{fontSize:16}}>filter_alt</span>
          {filterYear && <span>{filterYear}</span>}
          {filterMonth && Array.isArray(months) && <span>/ {months[parseInt(filterMonth)-1]}</span>}
          {filterDay && <span>/ {filterDay}</span>}
          <span style={{color:'var(--text-muted)', fontWeight:400}}>— {filtered.length} {lang === 'kz' ? 'нәтиже' : 'результатов'}</span>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <span className="material-icons-outlined">inventory_2</span>
            </div>
            <div className="empty-state-title">{t('archive.no_results')}</div>
          </div>
        </div>
      ) : (
        <div className="archive-grid">
          {filtered.map(r => {
            const isProtocol = docType === 'protocol' || (r.resolution_type || '').toLowerCase().includes('хаттама') || (r.resolution_type || '').toLowerCase().includes('протокол');
            const d = new Date(r.created_at);
            return (
              <div key={r.id} className={`archive-card ${isProtocol ? 'protocol-card' : ''}`} onClick={() => handlePreview(r.id)}>
                <div className="archive-card-header">
                  <div className="archive-card-type">
                    <span className={`material-icons-outlined ${isProtocol ? 'protocol-blue-icon' : ''}`} style={{color: isProtocol ? '#0044CC' : 'var(--primary)'}}>
                      {isProtocol ? 'history_edu' : 'description'}
                    </span>
                    {r.resolution_type}
                  </div>
                  <span style={{
                    fontSize:'var(--font-xs)', color:'var(--text-muted)', fontWeight:500,
                    background:'var(--bg-input)', padding:'2px 8px', borderRadius:'var(--radius-full)'
                  }}>
                    {d.getFullYear()}/{String(d.getMonth()+1).padStart(2,'0')}/{String(d.getDate()).padStart(2,'0')}
                  </span>
                </div>
                <div className="archive-card-body">
                  <div className="archive-card-case">№ {r.case_number}</div>
                  <div className="archive-card-meta">
                    {d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • {r.language === 'kz' ? 'ҚАЗ' : 'РУС'}
                  </div>
                  {r.investigator_name && <div className="archive-card-investigator">{r.investigator_name}</div>}
                </div>
                <div className="archive-card-actions" onClick={e => e.stopPropagation()}>
                  <button className="archive-action-btn" onClick={() => handleDownload(r.id, 'docx')}>
                    <span className="material-icons-outlined">download</span> DOCX
                  </button>
                  <button className="archive-action-btn" onClick={() => handleDownload(r.id, 'pdf')}>
                    <span className="material-icons-outlined">picture_as_pdf</span> PDF
                  </button>
                  <button className="archive-action-btn delete" onClick={() => handleDelete(r.id)}>
                    <span className="material-icons-outlined">delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Modal */}
      {previewData && (
        <div className="modal-overlay" onClick={() => {setPreviewId(null); setPreviewData(null);}}>
          <div className="modal" style={{maxWidth:700}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{previewData.resolution_type}</h3>
              <button className="modal-close" onClick={() => {setPreviewId(null); setPreviewData(null);}}>
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="doc-preview">{previewData.content}</div>
              <div className="doc-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleDownload(previewData.id, 'docx')}>
                  <span className="material-icons-outlined" style={{fontSize:16}}>description</span>
                  DOCX
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => handleDownload(previewData.id, 'pdf')}>
                  <span className="material-icons-outlined" style={{fontSize:16}}>picture_as_pdf</span>
                  PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
