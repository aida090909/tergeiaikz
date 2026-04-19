import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const CATEGORY_ICONS = {
  case_start: 'gavel', persons: 'person_search', investigation: 'search',
  expertise: 'biotech', restraint: 'lock', restrictions: 'block',
  case_movement: 'swap_horiz', completion: 'task_alt'
};

export default function CreateResolutionPage() {
  const { t, api, apiDownload, showToast, lang } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [cases, setCases] = useState([]);
  const [types, setTypes] = useState({});
  const [selectedCase, setSelectedCase] = useState(location.state?.caseId || null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [generatedResolution, setGeneratedResolution] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api('/api/cases'),
      api('/api/resolutions/types')
    ]).then(([casesData, typesData]) => {
      setCases(casesData.cases || []);
      setTypes(typesData.types || {});
      setLoading(false);
      if (location.state?.caseId) setStep(2);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const handleGenerate = async () => {
    if (!selectedCase || !selectedType) return;
    setGenerating(true);
    try {
      const data = await api('/api/resolutions/generate', {
        method: 'POST',
        body: JSON.stringify({
          case_id: selectedCase,
          resolution_type: selectedType,
          category: selectedCategory,
          language: lang
        })
      });
      setGeneratedResolution(data.resolution);
      setStep(4);
      showToast(t('resolutions.success'), 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setGenerating(false);
  };

  const handleDownload = async (format) => {
    if (!generatedResolution) return;
    try {
      await apiDownload(
        `/api/resolutions/${generatedResolution.id}/download/${format}`,
        `resolution_${generatedResolution.id}.${format}`
      );
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveFinal = async () => {
    if (!generatedResolution) return;
    try {
      await api(`/api/resolutions/${generatedResolution.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'final' })
      });
      showToast(t('common.success'), 'success');
      setGeneratedResolution({...generatedResolution, status: 'final'});
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const selectedCaseData = cases.find(c => c.id === selectedCase);

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      {/* Progress Steps */}
      <div style={{
        display:'flex', justifyContent:'center', gap:8, marginBottom:32,
        flexWrap:'wrap'
      }}>
        {[1,2,3,4].map(s => (
          <div key={s} style={{
            display:'flex', alignItems:'center', gap:8
          }}>
            <div style={{
              width:32, height:32, borderRadius:'50%', display:'flex',
              alignItems:'center', justifyContent:'center', fontSize:'var(--font-sm)',
              fontWeight:600,
              background: step >= s ? 'var(--primary)' : 'var(--bg-input)',
              color: step >= s ? 'white' : 'var(--text-muted)',
              transition: 'all 0.3s ease'
            }}>
              {step > s ? <span className="material-icons-outlined" style={{fontSize:18}}>check</span> : s}
            </div>
            <span style={{
              fontSize:'var(--font-sm)', fontWeight:500,
              color: step >= s ? 'var(--text-primary)' : 'var(--text-muted)',
              display: s === 4 ? 'inline' : undefined
            }}>
              {s === 1 && t('resolutions.select_case')}
              {s === 2 && t('resolutions.select_category')}
              {s === 3 && t('resolutions.select_type')}
              {s === 4 && t('resolutions.preview')}
            </span>
            {s < 4 && <div style={{width:40, height:2, background: step > s ? 'var(--primary)' : 'var(--border-light)', borderRadius:1}}></div>}
          </div>
        ))}
      </div>

      {/* Step 1: Select Case */}
      {step === 1 && (
        <div className="card">
          <div className="card-title" style={{marginBottom:16}}>
            <span className="material-icons-outlined" style={{verticalAlign:'middle', marginRight:8, color:'var(--primary)'}}>folder_open</span>
            {t('resolutions.select_case')}
          </div>
          <p style={{fontSize:'var(--font-sm)', color:'var(--text-secondary)', marginBottom:20}}>
            {t('resolutions.select_case_desc')}
          </p>
          {cases.length === 0 ? (
            <div className="empty-state" style={{padding:30}}>
              <div className="empty-state-title">{t('dashboard.no_cases')}</div>
              <button className="btn btn-primary" onClick={() => navigate('/cases')}>
                {t('dashboard.create_case')}
              </button>
            </div>
          ) : (
            <div className="data-list">
              {cases.map(c => (
                <div key={c.id}
                  className={`data-list-item ${selectedCase === c.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedCase(c.id); setStep(2); }}
                  style={selectedCase === c.id ? {background:'rgba(0,136,255,0.06)', margin:'0 -20px', padding:'14px 20px', borderRadius:'var(--radius-md)'} : {}}
                >
                  <div className="data-list-icon blue">
                    <span className="material-icons-outlined">folder</span>
                  </div>
                  <div className="data-list-content">
                    <div className="data-list-title">№ {c.case_number}</div>
                    <div className="data-list-sub">{t('cases.article')}: {c.article} {c.suspect_name && `• ${c.suspect_name}`}</div>
                  </div>
                  <span className="material-icons-outlined" style={{color: selectedCase === c.id ? 'var(--primary)' : 'var(--border-input)', fontSize:22}}>
                    {selectedCase === c.id ? 'radio_button_checked' : 'radio_button_unchecked'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Category */}
      {step === 2 && (
        <div className="card">
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:16}}>
            <button className="btn btn-icon" onClick={() => setStep(1)}>
              <span className="material-icons-outlined">arrow_back</span>
            </button>
            <div className="card-title">{t('resolutions.select_category')}</div>
          </div>
          {selectedCaseData && (
            <div style={{background:'var(--bg-input)', padding:'10px 14px', borderRadius:'var(--radius-sm)', fontSize:'var(--font-sm)', marginBottom:16, display:'flex', alignItems:'center', gap:8}}>
              <span className="material-icons-outlined" style={{fontSize:18, color:'var(--primary)'}}>folder</span>
              <span style={{fontWeight:500}}>№ {selectedCaseData.case_number}</span>
              <span style={{color:'var(--text-muted)'}}>• {selectedCaseData.article}</span>
            </div>
          )}
          <div className="category-grid">
            {Object.entries(types).map(([key, cat]) => (
              <div key={key}
                className={`category-item ${selectedCategory === key ? 'selected' : ''}`}
                onClick={() => { setSelectedCategory(key); setSelectedType(null); setStep(3); }}
              >
                <div className="category-item-icon">
                  <span className="material-icons-outlined">{CATEGORY_ICONS[key] || 'description'}</span>
                </div>
                <div className="category-item-name">
                  {t(`categories.${key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Select Type */}
      {step === 3 && selectedCategory && types[selectedCategory] && (
        <div className="card">
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:16}}>
            <button className="btn btn-icon" onClick={() => setStep(2)}>
              <span className="material-icons-outlined">arrow_back</span>
            </button>
            <div className="card-title">{t('resolutions.select_type')}</div>
          </div>
          {selectedCaseData && (
            <div style={{background:'var(--bg-input)', padding:'10px 14px', borderRadius:'var(--radius-sm)', fontSize:'var(--font-sm)', marginBottom:16, display:'flex', alignItems:'center', gap:8}}>
              <span className="material-icons-outlined" style={{fontSize:18, color:'var(--primary)'}}>folder</span>
              <span style={{fontWeight:500}}>№ {selectedCaseData.case_number}</span>
              <span style={{color:'var(--text-muted)'}}>• {t(`categories.${selectedCategory}`)}</span>
            </div>
          )}
          <div className="type-list">
            {Object.entries(types[selectedCategory].types).map(([typeKey, typeVal]) => (
              <div key={typeKey}
                className={`type-item ${selectedType === typeKey ? 'selected' : ''}`}
                onClick={() => setSelectedType(typeKey)}
              >
                <span className="type-item-dot"></span>
                {lang === 'kz' ? typeVal.name_kz : typeVal.name_ru}
              </div>
            ))}
          </div>
          {selectedType && (
            <div style={{marginTop:20, textAlign:'center'}}>
              <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <>
                    <span className="spinner" style={{width:20,height:20,borderWidth:2}}></span>
                    {t('resolutions.generating')}
                  </>
                ) : (
                  <>
                    <span className="material-icons-outlined" style={{fontSize:20}}>auto_fix_high</span>
                    {t('resolutions.generate')}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Preview */}
      {step === 4 && generatedResolution && (
        <div className="card">
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:16}}>
            <button className="btn btn-icon" onClick={() => setStep(3)}>
              <span className="material-icons-outlined">arrow_back</span>
            </button>
            <div className="card-title">{t('resolutions.preview')}</div>
            <span className={`status-badge ${generatedResolution.status}`} style={{marginLeft:'auto'}}>
              <span className="status-badge-dot"></span>
              {generatedResolution.status}
            </span>
          </div>

          <div className="doc-preview">
            {generatedResolution.content}
          </div>

          <div className="doc-actions">
            <button className="btn btn-primary" onClick={() => handleDownload('docx')}>
              <span className="material-icons-outlined" style={{fontSize:18}}>description</span>
              {t('resolutions.download_docx')}
            </button>
            <button className="btn btn-primary" onClick={() => handleDownload('pdf')}>
              <span className="material-icons-outlined" style={{fontSize:18}}>picture_as_pdf</span>
              {t('resolutions.download_pdf')}
            </button>
            {generatedResolution.status === 'draft' && (
              <button className="btn btn-secondary" onClick={handleSaveFinal}>
                <span className="material-icons-outlined" style={{fontSize:18}}>check_circle</span>
                {t('resolutions.save_final')}
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => {
              setStep(1); setSelectedCase(null); setSelectedCategory(null);
              setSelectedType(null); setGeneratedResolution(null);
            }}>
              <span className="material-icons-outlined" style={{fontSize:18}}>add</span>
              {lang === 'kz' ? 'Жаңа қаулы' : 'Новое постановление'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
