import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const RESOLUTION_TYPES = [
  { id: 'r1', name_kz: 'Қылмыстық іс қозғау және істі өзінің іс жүргізуіне қабылдау туралы қаулы', name_ru: 'Постановление о возбуждении уголовного дела и принятии его к своему производству' },
  { id: 'r2', name_kz: 'Қылмыстық іс қозғаудан бас тарту туралы қаулы', name_ru: 'Постановление об отказе в возбуждении уголовного дела' },
  { id: 'r3', name_kz: 'Қылмыстық істі бөлу туралы қаулы', name_ru: 'Постановление о выделении уголовного дела' },
  { id: 'r4', name_kz: 'Қылмыстық істерді біріктіру туралы қаулы', name_ru: 'Постановление о соединении уголовных дел' },
  { id: 'r5', name_kz: 'Алдын ала тергеу және айыпталушыны қамауда ұстау мерзімін ұзарту жөнінде өтініш қозғау туралы қаулы', name_ru: 'Постановление о возбуждении ходатайства о продлении срока предварительного следствия и содержания обвиняемого под стражей' },
  { id: 'r6', name_kz: 'Жәбірленуші деп тану туралы қаулы', name_ru: 'Постановление о признании потерпевшим' },
  { id: 'r7', name_kz: 'Жәбірленушінің заңды өкілі деп тану туралы қаулы', name_ru: 'Постановление о признании законным представителем потерпевшего' },
  { id: 'r8', name_kz: 'Кәмелетке толмағанның заңды өкілі деп тану туралы қаулы', name_ru: 'Постановление о признании законным представителем несовершеннолетнего' },
  { id: 'r9', name_kz: 'Азаматтық талапкер деп тану туралы қаулы', name_ru: 'Постановление о признании гражданским истцом' },
  { id: 'r10', name_kz: 'Азаматтық жауапкер деп тану туралы қаулы', name_ru: 'Постановление о признании гражданским ответчиком' },
  { id: 'r11', name_kz: 'Айыпталушы ретінде жауапқа тарту туралы қаулы', name_ru: 'Постановление о привлечении в качестве обвиняемого' },
  { id: 'r12', name_kz: 'Айыпталушыны қызметінен шеттету туралы қаулы', name_ru: 'Постановление об отстранении обвиняемого от должности' },
  { id: 'r13', name_kz: 'Айыпталушыны алып келу туралы қаулы', name_ru: 'Постановление о приводе обвиняемого' },
  { id: 'r14', name_kz: 'Айыпталушыға қатысты қамауға алу-бұлтартпау шарасын қолдану туралы қаулы', name_ru: 'Постановление о применении меры пресечения в виде заключения под стражу в отношении обвиняемого' },
  { id: 'r15', name_kz: 'Айыпталушыға (сезіктіге) қатысты бұлтартпау шарасын қолдану туралы қаулы', name_ru: 'Постановление о применении меры пресечения в отношении обвиняемого (подозреваемого)' },
  { id: 'r16', name_kz: 'Айыпталушыға қатысты бұлтартпау шарасын өзгерту туралы қаулы', name_ru: 'Постановление об изменении меры пресечения в отношении обвиняемого' },
  { id: 'r17', name_kz: 'Бұлтартпау шарасын тоқтату туралы қаулы', name_ru: 'Постановление об отмене меры пресечения' },
  { id: 'r18', name_kz: 'Куәні айдап әкелу туралы қаулы', name_ru: 'Постановление о приводе свидетеля' },
  { id: 'r19', name_kz: 'Тінту жүргізу туралы қаулы', name_ru: 'Постановление о производстве обыска' },
  { id: 'r20', name_kz: 'Алу жүргізу туралы қаулы', name_ru: 'Постановление о производстве выемки' },
  { id: 'r21', name_kz: 'Жазу үлгілерін, саусақ таңбаларын және т.б. алу туралы қаулы', name_ru: 'Постановление о получении образцов почерка, отпечатков пальцев и др.' },
  { id: 'r22', name_kz: 'Мүлікке тыйым салу туралы қаулы', name_ru: 'Постановление о наложении ареста на имущество' },
  { id: 'r23', name_kz: 'Почта-телеграф хат-хабарын тұтқындау және оны алу туралы қаулы', name_ru: 'Постановление о наложении ареста на почтово-телеграфную корреспонденцию и её выемке' },
  { id: 'r24', name_kz: 'Куәландыру жүргізу туралы қаулы', name_ru: 'Постановление о производстве освидетельствования' },
  { id: 'r25', name_kz: 'Заттай дәлелдемелерді іске қоса тігу туралы қаулы', name_ru: 'Постановление о приобщении вещественных доказательств к делу' },
  { id: 'r26', name_kz: 'Сот сараптамасын тағайындау туралы қаулы', name_ru: 'Постановление о назначении судебной экспертизы' },
  { id: 'r27', name_kz: 'Қосымша сараптама тағайындау туралы қаулы', name_ru: 'Постановление о назначении дополнительной экспертизы' },
  { id: 'r28', name_kz: 'Қайталама сараптама тағайындау туралы қаулы', name_ru: 'Постановление о назначении повторной экспертизы' },
  { id: 'r29', name_kz: 'Кешенді сараптама тағайындау туралы қаулы', name_ru: 'Постановление о назначении комплексной экспертизы' },
  { id: 'r30', name_kz: 'Сотқа дейінгі тергеп-тексеруді тоқтату және айыпталушыға іздестіру жариялау туралы қаулы', name_ru: 'Постановление о приостановлении досудебного расследования и объявлении розыска обвиняемого' },
  { id: 'r31', name_kz: 'Айыпталушы ретінде жауапқа тартуға жататын адамның анықталмауы себепті алдын ала тергеуді тоқтата тұру туралы қаулы', name_ru: 'Постановление о приостановлении предварительного следствия в связи с неустановлением лица, подлежащего привлечению в качестве обвиняемого' },
  { id: 'r32', name_kz: 'Шын өкінуіне байланысты қылмыстық істі қысқарту туралы қаулы', name_ru: 'Постановление о прекращении уголовного дела в связи с деятельным раскаянием' },
  { id: 'r33', name_kz: 'Жағдайдың өзгеруіне байланысты қылмыстық істі қысқарту туралы қаулы', name_ru: 'Постановление о прекращении уголовного дела в связи с изменением обстановки' },
  { id: 'r34', name_kz: 'Жәбірленушімен ымыраласуға байланысты қылмыстық істі қысқарту туралы қаулы', name_ru: 'Постановление о прекращении уголовного дела в связи с примирением с потерпевшим' },
  { id: 'r35', name_kz: 'Қылмыстық істі қысқарту туралы қаулы', name_ru: 'Постановление о прекращении уголовного дела' },
];

export default function CreateResolutionPage() {
  const { t, api, apiDownload, showToast, lang } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(location.state?.caseId || null);
  const [loading, setLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [timeSet, setTimeSet] = useState(false);
  const [generatedDoc, setGeneratedDoc] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    api('/api/cases')
      .then(data => {
        setCases(data.cases || []);
        setLoading(false);
        if (location.state?.caseId) { setSelectedCase(location.state.caseId); setStep(2); }
      })
      .catch(() => setLoading(false));
  }, []);

  // Load saved chat when case is selected
  useEffect(() => {
    if (selectedCase && step === 2) {
      const saved = localStorage.getItem(`chat_resolution_${selectedCase}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMessages(parsed.messages || []);
          setSelectedType(parsed.selectedType || null);
          setStartTime(parsed.startTime || '');
          setEndTime(parsed.endTime || '');
          setTimeSet(parsed.timeSet || false);
          setGeneratedDoc(parsed.generatedDoc || null);
        } catch {}
      } else {
        setMessages([{
          id: Date.now(), role: 'bot',
          text: t('chat.ai_greeting_resolution'),
          timestamp: new Date().toISOString()
        }]);
        setSelectedType(null);
        setStartTime('');
        setEndTime('');
        setTimeSet(false);
        setGeneratedDoc(null);
      }
    }
  }, [selectedCase, step, lang]);

  // Save chat to localStorage
  useEffect(() => {
    if (selectedCase && step === 2 && messages.length > 0) {
      localStorage.setItem(`chat_resolution_${selectedCase}`, JSON.stringify({
        messages, selectedType, startTime, endTime, timeSet, generatedDoc
      }));
    }
  }, [messages, selectedType, startTime, endTime, timeSet, generatedDoc, selectedCase, step]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role, text, extra = {}) => {
    const msg = { id: Date.now() + Math.random(), role, text, timestamp: new Date().toISOString(), ...extra };
    setMessages(prev => [...prev, msg]);
    return msg;
  };

  const handleSend = async () => {
    if (!inputText.trim() && !selectedType) return;
    const userText = inputText.trim();
    setInputText('');
    if (userText) addMessage('user', userText);
    if (!selectedType) {
      addMessage('bot', lang === 'kz' ? '«+» батырмасын басып алдымен қаулы түрін таңдаңыз.' : 'Пожалуйста, сначала выберите тип постановления, нажав «+».');
      return;
    }
    setSending(true);
    addMessage('bot', t('chat.generating'), { loading: true });
    try {
      const typeName = lang === 'kz'
        ? RESOLUTION_TYPES.find(r => r.id === selectedType)?.name_kz
        : RESOLUTION_TYPES.find(r => r.id === selectedType)?.name_ru;
      const data = await api('/api/resolutions/generate', {
        method: 'POST',
        body: JSON.stringify({
          case_id: selectedCase,
          resolution_type: typeName || selectedType,
          category: 'resolutions',
          language: lang,
          user_input: userText
        })
      });
      const doc = data.resolution;
      setGeneratedDoc(doc);
      setMessages(prev => {
        const updated = prev.filter(m => !m.loading);
        return [...updated, {
          id: Date.now(), role: 'bot',
          text: t('chat.doc_ready'),
          timestamp: new Date().toISOString(),
          doc
        }];
      });
      showToast(t('resolutions.success'), 'success');
    } catch (err) {
      setMessages(prev => {
        const updated = prev.filter(m => !m.loading);
        return [...updated, { id: Date.now(), role: 'bot', text: err.message || t('common.error'), timestamp: new Date().toISOString() }];
      });
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleFileAttach = (e) => {
    const file = e.target.files[0];
    if (file) {
      addMessage('user', `📎 ${file.name}`);
      addMessage('bot', `${t('chat.file_attached')}: ${file.name}`);
    }
    e.target.value = '';
  };

  const handleSelectType = (type) => {
    setSelectedType(type.id);
    setPanelOpen(false);
    const typeName = lang === 'kz' ? type.name_kz : type.name_ru;
    addMessage('bot', `✅ ${t('chat.type_selected')}: ${typeName}`);
  };

  const handleTimeConfirm = () => {
    if (!startTime || !endTime) return;
    setTimeSet(true);
    setShowTimePicker(false);
    addMessage('bot', `⏰ ${t('chat.time_set')}: ${startTime} – ${endTime}`);
  };

  const handleDownload = async (docId, format) => {
    try {
      await apiDownload(`/api/resolutions/${docId}/download/${format}`, `resolution_${docId}.${format}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const selectedCaseData = cases.find(c => c.id.toString() === selectedCase?.toString());
  const selectedTypeName = selectedType
    ? (lang === 'kz' ? RESOLUTION_TYPES.find(r => r.id === selectedType)?.name_kz : RESOLUTION_TYPES.find(r => r.id === selectedType)?.name_ru) || null
    : null;

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
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
              <button className="btn btn-primary" onClick={() => navigate('/cases')}>{t('dashboard.create_case')}</button>
            </div>
          ) : (
            <div className="data-list">
              {cases.map(c => (
                <div key={c.id}
                  className={`data-list-item ${selectedCase === c.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedCase(c.id); setStep(2); }}
                  style={selectedCase === c.id ? {background:'rgba(0,136,255,0.06)', margin:'0 -20px', padding:'14px 20px', borderRadius:'var(--radius-md)'} : {}}
                >
                  <div className="data-list-icon blue"><span className="material-icons-outlined">folder</span></div>
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

      {/* Step 2: Chat */}
      {step === 2 && (
        <div style={{display:'flex', gap:0, height:'calc(100vh - var(--header-height) - 48px)', position:'relative'}}>
          {/* Chat Area */}
          <div style={{
            flex:1, display:'flex', flexDirection:'column',
            background:'var(--bg-card)', borderRadius:'var(--radius-xl)',
            boxShadow:'var(--shadow-card)', overflow:'hidden',
            transition:'margin-right 0.3s ease',
            marginRight: panelOpen ? '320px' : 0
          }}>
            {/* Chat Header */}
            <div style={{
              padding:'16px 20px', borderBottom:'1px solid var(--border-light)',
              display:'flex', alignItems:'center', gap:12
            }}>
              <button className="btn btn-icon" onClick={() => setStep(1)}>
                <span className="material-icons-outlined">arrow_back</span>
              </button>
              <div style={{
                background:'linear-gradient(135deg,#00C48C,#00B4D8)', color:'white', flexShrink:0,
                width:36, height:36, borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center'
              }}>
                <span className="material-icons-outlined" style={{fontSize:20}}>smart_toy</span>
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, fontSize:'var(--font-base)', color:'var(--text-primary)'}}>
                  {t('chat.title')} — AI
                </div>
                {selectedCaseData && (
                  <div style={{fontSize:'var(--font-xs)', color:'var(--text-muted)'}}>
                    № {selectedCaseData.case_number}
                    {selectedTypeName && ` • ${selectedTypeName}`}
                  </div>
                )}
              </div>
              {selectedType && (
                <span className="status-badge active" style={{fontSize:'var(--font-xs)'}}>
                  <span className="status-badge-dot"></span>
                  {lang === 'kz' ? 'Түрі таңдалды' : 'Тип выбран'}
                </span>
              )}
            </div>

            {/* Messages */}
            <div className="chat-messages" style={{flex:1, overflowY:'auto', padding:'24px', display:'flex', flexDirection:'column', gap:16}}>
              {messages.map(msg => (
                <div key={msg.id} className={`chat-message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                  {msg.role === 'bot' && (
                    <div style={{
                      background:'linear-gradient(135deg,#00C48C,#00B4D8)', color:'white', flexShrink:0,
                      width:36, height:36, borderRadius:'50%',
                      display:'flex', alignItems:'center', justifyContent:'center'
                    }}>
                      <span className="material-icons-outlined" style={{fontSize:18}}>smart_toy</span>
                    </div>
                  )}
                  <div style={{display:'flex', flexDirection:'column', gap:8, maxWidth:'75%'}}>
                    <div style={
                      msg.role === 'user'
                        ? {background:'var(--primary)', color:'white', borderBottomRightRadius:4, padding:'12px 16px', borderRadius:'var(--radius-lg)', fontSize:'var(--font-base)'}
                        : {background:'var(--bg-input)', color:'var(--text-primary)', borderBottomLeftRadius:4, padding:'12px 16px', borderRadius:'var(--radius-lg)', fontSize:'var(--font-base)'}
                    }>
                      {msg.loading ? (
                        <span style={{display:'flex', alignItems:'center', gap:8}}>
                          <span className="spinner" style={{width:16, height:16, borderWidth:2}}></span>
                          {msg.text}
                        </span>
                      ) : msg.text}
                    </div>
                    {msg.doc && (
                      <div style={{
                        background:'white', border:'1px solid var(--border-light)',
                        borderRadius:'var(--radius-md)', padding:0, marginTop:8,
                        overflow:'hidden', maxWidth:'100%'
                      }}>
                        <textarea
                          defaultValue={msg.doc.content || ''}
                          onChange={e => {
                            const updated = {...msg.doc, content: e.target.value};
                            setMessages(prev => prev.map(m => m.id === msg.id ? {...m, doc: updated} : m));
                            setGeneratedDoc(updated);
                          }}
                          style={{
                            width:'100%', minHeight:250, maxHeight:400, padding:'16px 20px',
                            border:'none', outline:'none', resize:'vertical',
                            fontFamily:"'Times New Roman', serif", fontSize:13, lineHeight:1.7,
                            color:'var(--text-primary)', background:'#FAFBFF',
                            whiteSpace:'pre-wrap'
                          }}
                        />
                        <div style={{display:'flex', gap:8, padding:'10px 16px', borderTop:'1px solid var(--border-light)', background:'white'}}>
                          <button className="btn btn-primary btn-sm" onClick={() => handleDownload(msg.doc.id, 'docx')}>
                            <span className="material-icons-outlined" style={{fontSize:16}}>description</span>
                            DOCX
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={() => handleDownload(msg.doc.id, 'pdf')}>
                            <span className="material-icons-outlined" style={{fontSize:16}}>picture_as_pdf</span>
                            PDF
                          </button>
                        </div>
                      </div>
                    )}
                    <div style={{fontSize:'var(--font-xs)', color:'var(--text-muted)', alignSelf: msg.role==='user' ? 'flex-end' : 'flex-start'}}>
                      {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                    </div>
                  </div>
                  {msg.role === 'user' && (
                    <div style={{
                      background:'var(--bg-input)', color:'var(--text-secondary)', flexShrink:0,
                      width:36, height:36, borderRadius:'50%',
                      display:'flex', alignItems:'center', justifyContent:'center'
                    }}>
                      <span className="material-icons-outlined" style={{fontSize:18}}>person</span>
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Time Picker Popup */}
            {showTimePicker && (
              <div style={{
                position:'absolute', bottom:100, left:'50%', transform:'translateX(-50%)',
                background:'white', borderRadius:'var(--radius-lg)', padding:20,
                boxShadow:'var(--shadow-lg)', border:'1px solid var(--border-light)',
                zIndex:10, minWidth:300, animation:'slideUp 0.2s ease'
              }}>
                <div style={{fontWeight:600, marginBottom:16, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span>⏰ {t('chat.select_time')}</span>
                  <button className="btn-icon" onClick={() => setShowTimePicker(false)}>
                    <span className="material-icons-outlined">close</span>
                  </button>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('chat.start_time')}</label>
                    <input type="time" className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('chat.end_time')}</label>
                    <input type="time" className="form-input" value={endTime} onChange={e => setEndTime(e.target.value)} />
                  </div>
                </div>
                <button className="btn btn-primary btn-full" onClick={handleTimeConfirm} disabled={!startTime || !endTime}>
                  {t('chat.time_confirm')}
                </button>
              </div>
            )}

            {/* Input Area */}
            <div style={{
              padding:'12px 16px', borderTop:'1px solid var(--border-light)',
              background:'white', display:'flex', flexDirection:'column', gap:8
            }}>
              {/* Extra action buttons */}
              <div style={{display:'flex', gap:6, alignItems:'center'}}>
                <button
                  onClick={() => setPanelOpen(v => !v)}
                  title={t('chat.resolution_panel_title')}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'center',
                    width:36, height:36, borderRadius:'var(--radius-md)',
                    background: panelOpen ? 'var(--primary)' : 'var(--bg-input)',
                    color: panelOpen ? 'white' : 'var(--text-secondary)',
                    border:'1.5px solid ' + (panelOpen ? 'var(--primary)' : 'var(--border-light)'),
                    transition:'all 0.2s ease', cursor:'pointer', fontWeight:700
                  }}
                >
                  <span className="material-icons-outlined" style={{fontSize:20}}>{panelOpen ? 'close' : 'add'}</span>
                </button>

                <button
                  onClick={() => setShowTimePicker(v => !v)}
                  title={t('chat.select_time')}
                  style={{
                    display:'flex', alignItems:'center', gap:4,
                    padding:'6px 12px', borderRadius:'var(--radius-md)',
                    background: timeSet ? 'rgba(0,136,255,0.08)' : 'var(--bg-input)',
                    color: timeSet ? 'var(--primary)' : 'var(--text-secondary)',
                    border:'1.5px solid ' + (timeSet ? 'var(--primary)' : 'var(--border-light)'),
                    transition:'all 0.2s ease', cursor:'pointer', fontSize:'var(--font-sm)', fontWeight:500
                  }}
                >
                  <span className="material-icons-outlined" style={{fontSize:18}}>schedule</span>
                  {timeSet ? `${startTime}–${endTime}` : t('chat.select_time')}
                </button>

                {selectedTypeName && (
                  <span style={{
                    fontSize:'var(--font-xs)', color:'var(--primary)',
                    background:'rgba(0,136,255,0.08)', padding:'4px 10px',
                    borderRadius:'var(--radius-full)', fontWeight:500,
                    border:'1px solid rgba(0,136,255,0.2)', whiteSpace:'nowrap',
                    overflow:'hidden', textOverflow:'ellipsis', maxWidth:200
                  }}>
                    {selectedTypeName}
                  </span>
                )}
              </div>

              {/* Main input row — NO voice button for resolutions */}
              <div style={{display:'flex', gap:8, alignItems:'flex-end'}}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title={t('chat.attach')}
                  style={{
                    width:40, height:40, borderRadius:20, flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background:'var(--bg-input)', color:'var(--text-secondary)',
                    border:'1.5px solid var(--border-light)',
                    cursor:'pointer', transition:'all 0.2s ease'
                  }}
                >
                  <span className="material-icons-outlined" style={{fontSize:20}}>attach_file</span>
                </button>
                <input ref={fileInputRef} type="file" hidden onChange={handleFileAttach} />

                <textarea
                  ref={textareaRef}
                  className="chat-input"
                  placeholder={t('chat.placeholder')}
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  style={{resize:'none', overflowY:'hidden', flex:1}}
                  onInput={e => { e.target.style.height='auto'; e.target.style.height=Math.min(e.target.scrollHeight,120)+'px'; }}
                />

                <button
                  className="chat-send-btn"
                  onClick={handleSend}
                  disabled={sending || (!inputText.trim() && !selectedType)}
                  title={t('chat.send')}
                >
                  <span className="material-icons-outlined" style={{fontSize:20}}>send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Slide-in Panel — Resolution Types */}
          <div style={{
            position:'absolute', right:0, top:0, bottom:0,
            width: panelOpen ? '310px' : '0',
            background:'white', borderRadius: panelOpen ? '0 var(--radius-xl) var(--radius-xl) 0' : 0,
            boxShadow: panelOpen ? 'var(--shadow-lg)' : 'none',
            overflow:'hidden', transition:'width 0.3s ease',
            display:'flex', flexDirection:'column',
            borderLeft: panelOpen ? '1px solid var(--border-light)' : 'none'
          }}>
            {panelOpen && (
              <>
                <div style={{
                  padding:'16px 20px', borderBottom:'1px solid var(--border-light)',
                  display:'flex', alignItems:'center', justifyContent:'space-between'
                }}>
                  <div style={{fontWeight:600, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:8}}>
                    <span className="material-icons-outlined" style={{color:'var(--accent-green)', fontSize:20}}>gavel</span>
                    {t('chat.resolution_panel_title')}
                  </div>
                  <button className="btn btn-icon" onClick={() => setPanelOpen(false)}>
                    <span className="material-icons-outlined">chevron_right</span>
                  </button>
                </div>
                <div style={{flex:1, overflowY:'auto', padding:'12px'}}>
                  {RESOLUTION_TYPES.map(type => (
                    <div
                      key={type.id}
                      onClick={() => handleSelectType(type)}
                      style={{
                        padding:'12px 14px', borderRadius:'var(--radius-md)', cursor:'pointer',
                        marginBottom:6, transition:'all 0.15s ease',
                        background: selectedType === type.id ? 'rgba(108,92,231,0.08)' : 'var(--bg-input)',
                        border:'1.5px solid ' + (selectedType === type.id ? 'var(--primary)' : 'transparent'),
                        color: selectedType === type.id ? 'var(--primary)' : 'var(--text-primary)'
                      }}
                    >
                      <div style={{display:'flex', alignItems:'center', gap:8}}>
                        {selectedType === type.id && (
                          <span className="material-icons-outlined" style={{fontSize:16, color:'var(--primary)'}}>check_circle</span>
                        )}
                        <span style={{fontSize:'var(--font-sm)', fontWeight: selectedType===type.id ? 600 : 400}}>
                          {lang === 'kz' ? type.name_kz : type.name_ru}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
