import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';

const PROTOCOL_TYPES = [
  { id: 'p1', name_kz: 'Жасалған қылмыс туралы ауызша арызды қабылдау хаттамасы', name_ru: 'Протокол принятия устного заявления о совершённом преступлении' },
  { id: 'p2', name_kz: 'Кінәсін мойындап келу хаттамасы', name_ru: 'Протокол явки с повинной' },
  { id: 'p3', name_kz: 'Айыпталушыдан жауап алу хаттамасы', name_ru: 'Протокол допроса обвиняемого' },
  { id: 'p4', name_kz: 'Қылмыс жасады деп сезік келтірілген адамды ұстау хаттамасы', name_ru: 'Протокол задержания лица, подозреваемого в совершении преступления' },
  { id: 'p5', name_kz: 'Куәдан жауап алу хаттамасы', name_ru: 'Протокол допроса свидетеля' },
  { id: 'p6', name_kz: 'Кәмелетке толмағаннан жауап алу хаттамасы', name_ru: 'Протокол допроса несовершеннолетнего' },
  { id: 'p7', name_kz: 'Жәбірленушіден жауап алу хаттамасы', name_ru: 'Протокол допроса потерпевшего' },
  { id: 'p8', name_kz: 'Беттестіру хаттамасы', name_ru: 'Протокол очной ставки' },
  { id: 'p9', name_kz: 'Адамды тану хаттамасы', name_ru: 'Протокол опознания человека' },
  { id: 'p10', name_kz: 'Затты тану хаттамасы', name_ru: 'Протокол опознания предмета' },
  { id: 'p11', name_kz: 'Адамды фотосуреті бойынша тану хаттамасы', name_ru: 'Протокол опознания человека по фотографии' },
  { id: 'p12', name_kz: 'Тергеу экспериментінің хаттамасы', name_ru: 'Протокол следственного эксперимента' },
  { id: 'p13', name_kz: 'Айғақтарды тексеру мен нақтылау хаттамасы', name_ru: 'Протокол проверки и уточнения показаний на месте происшествия' },
  { id: 'p14', name_kz: 'Тінту хаттамасы', name_ru: 'Протокол обыска' },
  { id: 'p15', name_kz: 'Ұсталғанды жеке тінту хаттамасы', name_ru: 'Протокол личного обыска задержанного' },
  { id: 'p16', name_kz: 'Алу хаттамасы', name_ru: 'Протокол выемки' },
  { id: 'p17', name_kz: 'Салыстырмалы зерттеу үшін үлгілерді алу хаттамасы', name_ru: 'Протокол получения образцов для сравнительного исследования' },
  { id: 'p18', name_kz: 'Мүлікке тыйым салу хаттамасы', name_ru: 'Протокол наложения ареста на имущество' },
  { id: 'p19', name_kz: 'Оқиға болған жерді тексеру хаттамасы', name_ru: 'Протокол осмотра места происшествия' },
  { id: 'p20', name_kz: 'Оқиға болған жерді және мәйітті тексеру хаттамасы', name_ru: 'Протокол осмотра места происшествия и трупа' },
  { id: 'p21', name_kz: 'Заттай дәлелдемелерді тексеру хаттамасы', name_ru: 'Протокол осмотра вещественных доказательств' },
  { id: 'p22', name_kz: 'Куәландыру хаттамасы', name_ru: 'Протокол освидетельствования' },
  { id: 'p23', name_kz: 'Айыпталушыны сараптама тағайындау туралы қаулымен таныстыру хаттамасы', name_ru: 'Протокол ознакомления обвиняемого с постановлением о назначении экспертизы' },
  { id: 'p24', name_kz: 'Айыпталушыға танысу үшін сарапшы қорытындыларын көрсету хаттамасы', name_ru: 'Протокол предъявления обвиняемому заключения эксперта для ознакомления' },
  { id: 'p25', name_kz: 'Сарапшыдан жауап алу хаттамасы', name_ru: 'Протокол допроса эксперта' },
  { id: 'p26', name_kz: 'Тергеудің аяқталғаны туралы айыпталушыға хабарлау хаттамасы', name_ru: 'Протокол уведомления обвиняемого об окончании следствия' },
  { id: 'p27', name_kz: 'Айыпталушыны және оның қорғаушысын қылмыстық іс материалдарымен таныстыру хаттамасы', name_ru: 'Протокол ознакомления обвиняемого и его защитника с материалами уголовного дела' },
];

export default function CreateProtocolPage() {
  const { t, api, apiDownload, showToast, lang } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
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
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    api('/api/cases')
      .then(data => { setCases(data.cases || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Load saved chat when case is selected
  useEffect(() => {
    if (selectedCase && step === 2) {
      const saved = localStorage.getItem(`chat_protocol_${selectedCase}`);
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
        // Fresh greeting
        setMessages([{
          id: Date.now(),
          role: 'bot',
          text: t('chat.ai_greeting_protocol'),
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

  // Save chat to localStorage on every messages change
  useEffect(() => {
    if (selectedCase && step === 2 && messages.length > 0) {
      localStorage.setItem(`chat_protocol_${selectedCase}`, JSON.stringify({
        messages, selectedType, startTime, endTime, timeSet, generatedDoc
      }));
    }
  }, [messages, selectedType, startTime, endTime, timeSet, generatedDoc, selectedCase, step]);

  // Auto-scroll to bottom
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
      addMessage('bot', lang === 'kz' ? '«+» батырмасын басып алдымен хаттама түрін таңдаңыз.' : 'Пожалуйста, сначала выберите тип протокола, нажав «+».');
      return;
    }
    setSending(true);
    addMessage('bot', t('chat.generating'), { loading: true });
    try {
      const cases_ = JSON.parse(localStorage.getItem('demo_cases') || '[]');
      const caseItem = cases_.find(c => c.id.toString() === selectedCase.toString()) || cases.find(c => c.id.toString() === selectedCase.toString());
      const typeName = lang === 'kz'
        ? PROTOCOL_TYPES.find(p => p.id === selectedType)?.name_kz
        : PROTOCOL_TYPES.find(p => p.id === selectedType)?.name_ru;
      const data = await api('/api/resolutions/generate', {
        method: 'POST',
        body: JSON.stringify({
          case_id: selectedCase,
          resolution_type: typeName || selectedType,
          category: 'protocols',
          startTime: startTime || '09:00',
          endTime: endTime || '10:00',
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

  const handleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast(lang === 'kz' ? 'Браузер дауыс танымайды' : 'Браузер не поддерживает голосовой ввод', 'error');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'kz' ? 'kk-KZ' : 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputText(prev => prev + (prev ? ' ' : '') + transcript);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
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
      await apiDownload(`/api/resolutions/${docId}/download/${format}`, `protocol_${docId}.${format}`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const selectedCaseData = cases.find(c => c.id.toString() === selectedCase?.toString());

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
            {lang === 'kz' ? 'Хаттама жасау үшін істі таңдаңыз' : 'Выберите дело для создания протокола'}
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
              <div className="chat-message-avatar" style={{
                background:'var(--primary-gradient)', color:'white',
                width:36, height:36, borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0
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
                    {selectedType && ` • ${lang === 'kz' ? PROTOCOL_TYPES.find(p=>p.id===selectedType)?.name_kz : PROTOCOL_TYPES.find(p=>p.id===selectedType)?.name_ru}`}
                    {timeSet && ` • ${startTime}–${endTime}`}
                  </div>
                )}
              </div>
              <div style={{display:'flex', alignItems:'center', gap:6}}>
                {selectedType && (
                  <span className="status-badge active" style={{fontSize:'var(--font-xs)'}}>
                    <span className="status-badge-dot"></span>
                    {lang === 'kz' ? 'Түрі таңдалды' : 'Тип выбран'}
                  </span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages" style={{flex:1, overflowY:'auto', padding:'24px', display:'flex', flexDirection:'column', gap:16}}>
              {messages.map(msg => (
                <div key={msg.id} className={`chat-message ${msg.role === 'user' ? 'user' : 'bot'}`}>
                  {msg.role === 'bot' && (
                    <div className="chat-message-avatar" style={{
                      background:'var(--primary-gradient)', color:'white', flexShrink:0,
                      width:36, height:36, borderRadius:'50%',
                      display:'flex', alignItems:'center', justifyContent:'center'
                    }}>
                      <span className="material-icons-outlined" style={{fontSize:18}}>smart_toy</span>
                    </div>
                  )}
                  <div style={{display:'flex', flexDirection:'column', gap:8, maxWidth:'75%'}}>
                    <div className="chat-message-content" style={
                      msg.role === 'user'
                        ? {background:'var(--primary)', color:'white', borderBottomRightRadius:4, padding:'12px 16px', borderRadius:'var(--radius-lg)'}
                        : {background:'var(--bg-input)', color:'var(--text-primary)', borderBottomLeftRadius:4, padding:'12px 16px', borderRadius:'var(--radius-lg)'}
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
                <button
                  className="btn btn-primary btn-full"
                  onClick={handleTimeConfirm}
                  disabled={!startTime || !endTime}
                >
                  {t('chat.time_confirm')}
                </button>
              </div>
            )}

            {/* Input Area */}
            <div style={{
              padding:'12px 16px', borderTop:'1px solid var(--border-light)',
              background:'white', display:'flex', flexDirection:'column', gap:8
            }}>
              {/* Extra action buttons row */}
              <div style={{display:'flex', gap:6, alignItems:'center'}}>
                {/* + Panel button */}
                <button
                  className={`chat-action-btn ${panelOpen ? 'active' : ''}`}
                  onClick={() => setPanelOpen(v => !v)}
                  title={t('chat.protocol_panel_title')}
                  style={{
                    display:'flex', alignItems:'center', justifyContent:'center',
                    width:36, height:36, borderRadius:'var(--radius-md)',
                    background: panelOpen ? 'var(--primary)' : 'var(--bg-input)',
                    color: panelOpen ? 'white' : 'var(--text-secondary)',
                    border:'1.5px solid ' + (panelOpen ? 'var(--primary)' : 'var(--border-light)'),
                    transition:'all 0.2s ease', cursor:'pointer', fontWeight:700, fontSize:20
                  }}
                >
                  <span className="material-icons-outlined" style={{fontSize:20}}>{panelOpen ? 'close' : 'add'}</span>
                </button>

                {/* Time button */}
                <button
                  className={`chat-action-btn ${timeSet ? 'active' : ''}`}
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

                {selectedType && (
                  <span style={{
                    fontSize:'var(--font-xs)', color:'var(--primary)',
                    background:'rgba(0,136,255,0.08)', padding:'4px 10px',
                    borderRadius:'var(--radius-full)', fontWeight:500,
                    border:'1px solid rgba(0,136,255,0.2)'
                  }}>
                    {lang === 'kz' ? PROTOCOL_TYPES.find(p=>p.id===selectedType)?.name_kz : PROTOCOL_TYPES.find(p=>p.id===selectedType)?.name_ru}
                  </span>
                )}
              </div>

              {/* Main input row */}
              <div style={{display:'flex', gap:8, alignItems:'flex-end'}}>
                {/* Voice button */}
                <button
                  onClick={handleVoice}
                  title={t('chat.voice')}
                  style={{
                    width:40, height:40, borderRadius:20, flexShrink:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    background: isListening ? 'var(--accent-red)' : 'var(--bg-input)',
                    color: isListening ? 'white' : 'var(--text-secondary)',
                    border:'1.5px solid ' + (isListening ? 'var(--accent-red)' : 'var(--border-light)'),
                    cursor:'pointer', transition:'all 0.2s ease',
                    animation: isListening ? 'pulse 1s infinite' : 'none'
                  }}
                >
                  <span className="material-icons-outlined" style={{fontSize:20}}>
                    {isListening ? 'mic' : 'mic_none'}
                  </span>
                </button>

                {/* File attach */}
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

                {/* Text input */}
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

                {/* Send button */}
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

          {/* Right Slide-in Panel */}
          <div style={{
            position:'absolute', right:0, top:0, bottom:0,
            width: panelOpen ? '310px' : '0',
            background:'white', borderRadius: panelOpen ? '0 var(--radius-xl) var(--radius-xl) 0' : 0,
            boxShadow: panelOpen ? 'var(--shadow-lg)' : 'none',
            overflow:'hidden',
            transition:'width 0.3s ease',
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
                    <span className="material-icons-outlined" style={{color:'var(--primary)', fontSize:20}}>history_edu</span>
                    {t('chat.protocol_panel_title')}
                  </div>
                  <button className="btn btn-icon" onClick={() => setPanelOpen(false)}>
                    <span className="material-icons-outlined">chevron_right</span>
                  </button>
                </div>
                <div style={{flex:1, overflowY:'auto', padding:'12px'}}>
                  {PROTOCOL_TYPES.map(type => (
                    <div
                      key={type.id}
                      onClick={() => handleSelectType(type)}
                      style={{
                        padding:'12px 14px', borderRadius:'var(--radius-md)', cursor:'pointer',
                        marginBottom:6, transition:'all 0.15s ease',
                        background: selectedType === type.id ? 'rgba(0,136,255,0.08)' : 'var(--bg-input)',
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
