import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ArchivePage() {
  const { t, api, apiDownload, showToast, lang } = useApp();
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [docType, setDocType] = useState('resolution');
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
    const typeStr = (r.resolution_type || '').toLowerCase();
    const matchSearch = typeStr.includes(search.toLowerCase()) ||
      (r.case_number || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || r.status === filter;
    const isActuallyProtocol = typeStr.includes('хаттама') || typeStr.includes('протокол');
    const matchDocType = docType === 'resolution' ? !isActuallyProtocol : isActuallyProtocol;
    return matchSearch && matchFilter && matchDocType;
  });

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('archive.title')}</h1>
      </div>

      <div className="filter-tabs" style={{marginBottom: 16}}>
        {['resolution', 'protocol'].map(type => (
          <button
            key={type}
            className={`filter-tab ${docType === type ? 'active' : ''}`}
            onClick={() => {
              setDocType(type);
              setFilter('all');
            }}
          >
            <span className="material-icons-outlined" style={{fontSize:18, marginRight:6}}>
              {type === 'resolution' ? 'description' : 'history_edu'}
            </span>
            {type === 'resolution' ? t('archive.resolutions') : t('archive.protocols')}
          </button>
        ))}
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
        <div className="archive-grid">
          {filtered.map(r => {
            const isProtocol = docType === 'protocol' || (r.resolution_type || '').toLowerCase().includes('хаттама') || (r.resolution_type || '').toLowerCase().includes('протокол');
            return (
              <div key={r.id} className={`archive-card ${isProtocol ? 'protocol-card' : ''}`} onClick={() => handlePreview(r.id)}>
                <div className="archive-card-header">
                  <div className="archive-card-type">
                    <span className={`material-icons-outlined ${isProtocol ? 'protocol-blue-icon' : ''}`} style={{color: isProtocol ? '#0044CC' : 'var(--primary)'}}>
                      {isProtocol ? 'history_edu' : 'description'}
                    </span>
                    {r.resolution_type}
                  </div>
                  <span className={`status-badge-mini ${r.status} ${isProtocol ? 'protocol' : ''}`}>
                    {r.status === 'final' ? 'OK' : '...'}
                  </span>
                </div>
                <div className="archive-card-body">
                  <div className="archive-card-case">№ {r.case_number}</div>
                  <div className="archive-card-meta">
                    {new Date(r.created_at).toLocaleDateString()} • {r.language === 'kz' ? 'ҚАЗ' : 'РУС'}
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
