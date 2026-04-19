import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

export default function CreateProtocolPage() {
  const { t, api, apiDownload, showToast, lang } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [generatedProtocol, setGeneratedProtocol] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  const protocolTypes = [
    { id: 'interrogation_suspect', name_kz: 'Күдіктіден жауап алу хаттамасы', name_ru: 'Протокол допроса подозреваемого' },
    { id: 'interrogation_victim', name_kz: 'Жәбірленушіден жауап алу хаттамасы', name_ru: 'Протокол допроса потерпевшего' },
    { id: 'interrogation_witness', name_kz: 'Куәдан жауап алу хаттамасы', name_ru: 'Протокол допроса свидетеля' },
    { id: 'search_protocol', name_kz: 'Тінту хаттамасы', name_ru: 'Протокол обыска' },
    { id: 'seizure_protocol', name_kz: 'Алу хаттамасы', name_ru: 'Протокол выемки' },
    { id: 'inspection_protocol', name_kz: 'Оқиға орнын қарау хаттамасы', name_ru: 'Протокол осмотра места происшествия' },
    { id: 'lineup', name_kz: 'Тануға ұсыну хаттамасы', name_ru: 'Протокол предъявления для опознания' },
    { id: 'confrontation', name_kz: 'Беттестіру хаттамасы', name_ru: 'Протокол очной ставки' }
  ];

  useEffect(() => {
    api('/api/cases')
      .then(data => {
        setCases(data.cases || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleGenerate = async () => {
    if (!selectedCase || !selectedType || !startTime || !endTime) return;
    setGenerating(true);
    try {
      const data = await api('/api/resolutions/generate', {
        method: 'POST',
        body: JSON.stringify({
          case_id: selectedCase,
          resolution_type: selectedType,
          category: 'protocols',
          startTime,
          endTime,
          language: lang
        })
      });
      setGeneratedProtocol(data.resolution);
      setStep(4);
      showToast(t('resolutions.success'), 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
    setGenerating(false);
  };

  const handleDownload = async (format) => {
    if (!generatedProtocol) return;
    try {
      await apiDownload(
        `/api/resolutions/${generatedProtocol.id}/download/${format}`,
        `protocol_${generatedProtocol.id}.${format}`
      );
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  const selectedCaseData = cases.find(c => c.id === selectedCase);

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
              color: step >= s ? 'var(--text-primary)' : 'var(--text-muted)'
            }}>
              {s === 1 && t('resolutions.select_case')}
              {s === 2 && (lang === 'kz' ? 'Түрін таңдау' : 'Выбор типа')}
              {s === 3 && (lang === 'kz' ? 'Уақытты қою' : 'Настройка времени')}
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
            {lang === 'kz' ? 'Хаттама жасау үшін істі таңдаңыз' : 'Выберите дело для создания протокола'}
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
                    <div className="data-list-sub">{t('cases.article')}: {c.article}</div>
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

      {/* Step 2: Select Protocol Type */}
      {step === 2 && (
        <div className="card">
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:16}}>
            <button className="btn btn-icon" onClick={() => setStep(1)}>
              <span className="material-icons-outlined">arrow_back</span>
            </button>
            <div className="card-title">{lang === 'kz' ? 'Хаттама түрін таңдаңыз' : 'Выберите тип протокола'}</div>
          </div>
          {selectedCaseData && (
            <div style={{background:'var(--bg-input)', padding:'10px 14px', borderRadius:'var(--radius-sm)', fontSize:'var(--font-sm)', marginBottom:16, display:'flex', alignItems:'center', gap:8}}>
              <span className="material-icons-outlined" style={{fontSize:18, color:'var(--primary)'}}>folder</span>
              <span style={{fontWeight:500}}>№ {selectedCaseData.case_number}</span>
            </div>
          )}
          <div className="category-grid">
            {protocolTypes.map(type => (
              <div key={type.id}
                className={`category-item ${selectedType === type.id ? 'selected' : ''}`}
                onClick={() => { setSelectedType(type.id); setStep(3); }}
              >
                <div className="category-item-icon">
                  <span className="material-icons-outlined">history_edu</span>
                </div>
                <div className="category-item-name">
                  {lang === 'kz' ? type.name_kz : type.name_ru}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Set Times */}
      {step === 3 && (
        <div className="card">
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:16}}>
            <button className="btn btn-icon" onClick={() => setStep(2)}>
              <span className="material-icons-outlined">arrow_back</span>
            </button>
            <div className="card-title">{lang === 'kz' ? 'Уақытты белгілеу' : 'Установка времени'}</div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">{lang === 'kz' ? 'Басталу уақыты' : 'Время начала'}</label>
              <input type="time" className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">{lang === 'kz' ? 'Аяқталу уақыты' : 'Время окончания'}</label>
              <input type="time" className="form-input" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>
          <div style={{marginTop:24, textAlign:'center'}}>
            <button className="btn btn-primary btn-lg" onClick={handleGenerate} disabled={generating || !startTime || !endTime}>
              {generating ? (
                <><span className="spinner" style={{width:20,height:20,borderWidth:2}}></span> {t('resolutions.generating')}</>
              ) : (
                <><span className="material-icons-outlined" style={{fontSize:20}}>auto_fix_high</span> {t('resolutions.generate')}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Preview */}
      {step === 4 && generatedProtocol && (
        <div className="card">
          <div style={{display:'flex', alignItems:'center', gap:8, marginBottom:16}}>
            <button className="btn btn-icon" onClick={() => setStep(3)}>
              <span className="material-icons-outlined">arrow_back</span>
            </button>
            <div className="card-title">{t('resolutions.preview')}</div>
          </div>
          <div className="doc-preview">
            <div style={{padding: '16px', background: 'rgba(0, 34, 255, 0.05)', border: '1px solid rgba(0, 34, 255, 0.1)', borderRadius: 'var(--radius-md)', marginBottom: '16px'}}>
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                <span style={{color:'#0022FF', fontWeight:700}}>{lang === 'kz' ? 'Уақыты' : 'Время'}:</span>
                <span style={{fontWeight:800, color: '#0022FF'}}>{startTime} - {endTime}</span>
              </div>
            </div>
            {generatedProtocol.content}
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
            <button className="btn btn-secondary" onClick={() => {
              setStep(1); setSelectedCase(null); setSelectedType(null);
              setGeneratedProtocol(null);
            }}>
              <span className="material-icons-outlined" style={{fontSize:18}}>add</span>
              {lang === 'kz' ? 'Жаңа хаттама' : 'Новый протокол'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
