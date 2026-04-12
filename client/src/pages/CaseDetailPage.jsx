import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function CaseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, api, apiDownload, showToast, lang } = useApp();
  const [caseData, setCaseData] = useState(null);
  const [resolutions, setResolutions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadCase(); }, [id]);

  const loadCase = async () => {
    try {
      const data = await api(`/api/cases/${id}`);
      setCaseData(data.case);
      setResolutions(data.resolutions || []);
    } catch (err) {
      showToast(err.message, 'error');
      navigate('/cases');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(t('cases.delete_confirm'))) return;
    try {
      await api(`/api/cases/${id}`, { method: 'DELETE' });
      showToast(t('common.success'), 'success');
      navigate('/cases');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDownload = async (resId, format) => {
    try {
      await apiDownload(`/api/resolutions/${resId}/download/${format}`, `resolution_${resId}.${format}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!caseData) return null;

  return (
    <div>
      <div className="page-header">
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <button className="btn btn-icon" onClick={() => navigate('/cases')}>
            <span className="material-icons-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="page-title">№ {caseData.case_number}</h1>
            <div style={{fontSize:'var(--font-sm)', color:'var(--text-secondary)', marginTop:2}}>
              {t('cases.article')}: {caseData.article}
            </div>
          </div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/create', { state: { caseId: caseData.id } })}>
            <span className="material-icons-outlined" style={{fontSize:16}}>add</span>
            {t('dashboard.create_resolution')}
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleDelete}>
            <span className="material-icons-outlined" style={{fontSize:16}}>delete</span>
          </button>
        </div>
      </div>

      {/* Case Info */}
      <div className="card" style={{marginBottom:20}}>
        <div className="card-title" style={{marginBottom:16}}>{t('cases.title')}</div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px 24px', fontSize:'var(--font-sm)'}}>
          <div>
            <span style={{color:'var(--text-muted)'}}>{t('cases.case_number')}:</span>
            <div style={{fontWeight:500, marginTop:2}}>{caseData.case_number}</div>
          </div>
          <div>
            <span style={{color:'var(--text-muted)'}}>{t('cases.article')}:</span>
            <div style={{fontWeight:500, marginTop:2}}>{caseData.article}</div>
          </div>
          <div>
            <span style={{color:'var(--text-muted)'}}>{t('cases.suspect')}:</span>
            <div style={{fontWeight:500, marginTop:2}}>{caseData.suspect_name || '—'}</div>
          </div>
          <div>
            <span style={{color:'var(--text-muted)'}}>{t('cases.victim')}:</span>
            <div style={{fontWeight:500, marginTop:2}}>{caseData.victim_name || '—'}</div>
          </div>
          <div>
            <span style={{color:'var(--text-muted)'}}>{t('cases.city')}:</span>
            <div style={{fontWeight:500, marginTop:2}}>{caseData.city || '—'}</div>
          </div>
          <div>
            <span style={{color:'var(--text-muted)'}}>{t('cases.status')}:</span>
            <div style={{marginTop:4}}>
              <span className={`status-badge ${caseData.status}`}>
                <span className="status-badge-dot"></span>
                {t(`cases.status_${caseData.status}`)}
              </span>
            </div>
          </div>
          {caseData.description_ru && (
            <div style={{gridColumn:'1/-1'}}>
              <span style={{color:'var(--text-muted)'}}>{t('cases.description')}:</span>
              <div style={{fontWeight:400, marginTop:4, lineHeight:1.6}}>
                {lang === 'kz' ? (caseData.description_kz || caseData.description_ru) : caseData.description_ru}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resolutions */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            {t('cases.resolutions')} ({resolutions.length})
          </div>
        </div>

        {resolutions.length === 0 ? (
          <div style={{textAlign:'center', padding:30, color:'var(--text-muted)'}}>
            <span className="material-icons-outlined" style={{fontSize:48, display:'block', marginBottom:8}}>description</span>
            {t('dashboard.no_resolutions')}
          </div>
        ) : (
          <div className="data-list">
            {resolutions.map(r => (
              <div key={r.id} className="data-list-item" style={{cursor:'default'}}>
                <div className="data-list-icon green">
                  <span className="material-icons-outlined">description</span>
                </div>
                <div className="data-list-content">
                  <div className="data-list-title">{r.resolution_type}</div>
                  <div className="data-list-sub">
                    {new Date(r.created_at).toLocaleString()} • {r.language === 'kz' ? 'Қазақша' : 'Русский'}
                  </div>
                </div>
                <span className={`status-badge ${r.status}`}>
                  <span className="status-badge-dot"></span>
                  {r.status}
                </span>
                <div style={{display:'flex', gap:4}}>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleDownload(r.id, 'docx')}
                    title="DOCX">
                    <span className="material-icons-outlined" style={{fontSize:16}}>description</span>
                    DOCX
                  </button>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleDownload(r.id, 'pdf')}
                    title="PDF">
                    <span className="material-icons-outlined" style={{fontSize:16}}>picture_as_pdf</span>
                    PDF
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
