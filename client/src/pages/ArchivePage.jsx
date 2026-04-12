import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ArchivePage() {
  const { t, api, apiDownload, showToast, lang } = useApp();
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
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

  const filtered = resolutions.filter(r => {
    const matchSearch = (r.resolution_type || '').toLowerCase().includes(search.toLowerCase()) ||
      (r.case_number || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.status === filter;
    return matchSearch && matchFilter;
  });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('archive.title')}</h1>
      </div>

      <div className="search-bar">
        <span className="material-icons-outlined">search</span>
        <input type="text" placeholder={t('archive.search')} value={search}
          onChange={e => setSearch(e.target.value)} id="search-archive" />
      </div>

      <div className="filter-tabs">
        {['all', 'draft', 'final'].map(f => (
          <button key={f} className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>
            {f === 'all' ? t('archive.all') : f === 'draft' ? (lang === 'kz' ? 'Жоба' : 'Черновик') : (lang === 'kz' ? 'Түпкілікті' : 'Итоговый')}
          </button>
        ))}
      </div>

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
        <div className="card">
          <div className="data-list">
            {filtered.map(r => (
              <div key={r.id} className="data-list-item" onClick={() => handlePreview(r.id)}>
                <div className={`data-list-icon ${r.status === 'final' ? 'green' : 'gold'}`}>
                  <span className="material-icons-outlined">description</span>
                </div>
                <div className="data-list-content">
                  <div className="data-list-title">{r.resolution_type}</div>
                  <div className="data-list-sub">
                    № {r.case_number} • {r.language === 'kz' ? 'ҚАЗ' : 'РУС'}
                    {r.investigator_name && ` • ${r.investigator_name}`}
                  </div>
                </div>
                <span className={`status-badge ${r.status}`}>
                  <span className="status-badge-dot"></span>
                  {r.status}
                </span>
                <div className="data-list-meta">
                  {new Date(r.created_at).toLocaleDateString()}
                </div>
                <div style={{display:'flex', gap:4}} onClick={e => e.stopPropagation()}>
                  <button className="btn-icon" onClick={() => handleDownload(r.id, 'docx')} title="DOCX">
                    <span className="material-icons-outlined" style={{fontSize:18}}>description</span>
                  </button>
                  <button className="btn-icon" onClick={() => handleDownload(r.id, 'pdf')} title="PDF">
                    <span className="material-icons-outlined" style={{fontSize:18}}>picture_as_pdf</span>
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(r.id)} title={t('cases.delete')}
                    style={{color:'var(--accent-red)'}}>
                    <span className="material-icons-outlined" style={{fontSize:18}}>delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
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
