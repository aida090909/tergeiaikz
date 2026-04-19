import { createContext, useContext, useState, useEffect } from 'react';
import kz from '../i18n/kz.json';
import ru from '../i18n/ru.json';

const translations = { kz, ru };

const AppContext = createContext();

const GOLD_CASE_DATA = {
  case_number: '237856421003',
  resolution_case_number: '187112031000123',
  reg_date: '15 наурыз 2025 жыл',
  investigator: 'Л.А. Жаугаштиева',
  victim: {
    name: 'Серікбаев Нұржан Ермекұлы',
    birth: '12 сәуір 1990 жыл',
    place: 'Қарағанды облысы, Теміртау қаласы',
    nationality: 'қазақ',
    citizenship: 'Қазақстан Республикасы азаматы',
    education: 'жоғары',
    family: 'үйленген, 2 баласы бар',
    work: '“AstanaBuild” ЖШС, инженер',
    id_card: 'Жеке куәлік №045678912, 15.06.2020 ж. берілген',
    address: 'Астана қаласы, Алматы ауданы, Қошқарбаев көшесі, 45-үй, 12-пәтер',
    record: 'сотталмаған',
    phone: '+7 701 456 78 90'
  },
  narrative_kz: `Жоғарыда көрсетілген мекен-жайда отбасыммен бірге тұрамын. Наркологиялық және психоневрологиялық диспансерде есепте тұрмаймын. Бұрын қылмыстық жауапкершілікке тартылмағанмын.

2025 жылғы 10 наурыз күні шамамен сағат 14:30 шамасында Астана қаласында белгісіз ер адаммен таныстым. Ол өзін құрылыс материалдарын жеткізуші ретінде таныстырып, тиімді бағамен тауар жеткізіп беретінін айтты. Өзінің аты-жөнін Ахметов Диас Қанатұлы деп таныстырды.

Оның сөзіне сеніп, құрылыс материалдарын сатып алу мақсатында оған 1 250 000 (бір миллион екі жүз елу мың) теңге көлемінде ақшаны қолма-қол бердім. Алайда ол келісілген уақытта тауарды жеткізбеді и кейін байланысқа шықпай қойды.

Аталған азаматтың әрекеттері алаяқтық деп есептеймін и маған келтірілген материалдық шығынды өндіріп беруді сұраймын.

Күдіктінің сыртқы келбеті: бойы шамамен 175-180 см, дене бітімі орташа, жасы шамамен 35-40-та, шашы қара түсті, қысқа.

Оқиға кезінде жанымда әріптесім Қалибекова Айгүл Маратқызы болған, ол куә ретінде көрсете алады.

Айтарым осы, хаттама менің сөздерімнен дұрыс жазылды, оқып таныстым, толықтырулар мен ескертулерім жоқ.`,
  resolution_determination_kz: `2025 жылғы 10 наурыз күні сағат 14:30 шамасында Астана қаласы аумағында Ахметов Диас Қанатұлы азамат Серікбаев Нұржан Ермекұлын алдап, құрылыс материалдарын жеткізу сылтауымен 1 250 000 теңге көлемінде ақшасын иемденіп, оқиға орнынан жасырынған.

Осы әрекеттердің нәтижесінде Серікбаев Нұржан Ермекұлына материалдық зиян келтірілген.`
};

const INITIAL_DEMO_CASES = [
  {
    id: '237856421003',
    case_number: '237856421003',
    article: 'ҚР ҚК 190-бабы 2-бөлігі (Алаяқтық)',
    victim_name: 'Серікбаев Нұржан Ермекұлы',
    status: 'active',
    created_at: '2025-03-15T15:00:00.000Z'
  }
];

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('tergeu_token') || null);
  const [lang, setLang] = useState(localStorage.getItem('tergeu_lang') || 'kz');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('demo_cases')) {
      localStorage.setItem('demo_cases', JSON.stringify(INITIAL_DEMO_CASES));
    }
  }, []);

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[lang];
    for (const k of keys) {
      if (value && value[k] !== undefined) value = value[k];
      else return key;
    }
    return value;
  };

  const switchLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('tergeu_lang', newLang);
  };

  const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

  const login = async (iin, password) => {
    if (isDemo) {
      if (iin === '000000000001' && password === '12345') {
        const alikhan = { 
          iin: '000000000001', full_name: 'Жаугаштиева Л.А.', role: 'investigator', rank: 'полиция аға лейтенанты',
          work_place: 'Астана қаласы Алматы АІІБ-ның АПБ-нің ТБ'
        };
        setUser(alikhan); setToken('demo_token'); localStorage.setItem('tergeu_token', 'demo_token');
        localStorage.setItem('tergeu_demo_user', JSON.stringify(alikhan)); return { user: alikhan, token: 'demo_token' };
      }
      throw new Error('Пароль қате');
    }
    // Real API login
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ iin, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Қате пароль');
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('tergeu_token', data.token);
    return data;
  };

  const logout = () => { setToken(null); setUser(null); localStorage.removeItem('tergeu_token'); localStorage.removeItem('tergeu_demo_user'); };

  const api = async (url, options = {}) => {
    if (isDemo) {
      if (options.method === 'GET' || !options.method) {
        if (url.includes('/api/cases/')) {
          const id = url.split('/api/cases/')[1];
          const cases = JSON.parse(localStorage.getItem('demo_cases') || '[]');
          const c = cases.find(item => item.id.toString() === id.toString());
          const resos = JSON.parse(localStorage.getItem('demo_resolutions') || '[]');
          return { case: c, resolutions: resos.filter(r => r.case_number === c?.case_number) };
        }
        if (url.includes('/api/cases')) return { cases: JSON.parse(localStorage.getItem('demo_cases') || '[]') };
        if (url.includes('/api/resolutions/types')) {
          return {
            types: {
              case_start: {
                types: {
                  start: { name_kz: 'Қылмыстық істі қозғау туралы қаулы' },
                  refusal: { name_kz: 'Қылмыстық істі қозғаудан бас тарту туралы қаулы' },
                  dismiss: { name_kz: 'Қылмыстық істі тоқтату туралы қаулы' }
                }
              },
              persons: {
                types: {
                  suspect: { name_kz: 'Тұлғаны күдікті деп тану туралы қаулы' },
                  accused: { name_kz: 'Тұлғаны айыпталушы ретінде тарту туралы қаулы' },
                  victim: { name_kz: 'Жәбірленуші деп тану туралы қаулы' },
                  civil: { name_kz: 'Азаматтық талапкер/жауапкер деп тану туралы қаулы' }
                }
              },
              investigation: {
                types: {
                  search: { name_kz: 'Тінту жүргізу туралы қаулы' },
                  seizure: { name_kz: 'Алу жүргізу туралы қаулы' },
                  inspection: { name_kz: 'Қарау жүргізу туралы қаулы' },
                  expertise: { name_kz: 'Сараптама тағайындау туралы қаулы' }
                }
              },
              expertise: {
                types: {
                  main: { name_kz: 'Сот сараптамасын тағайындау туралы қаулы' },
                  additional: { name_kz: 'Қосымша сараптама туралы қаулы' },
                  repeated: { name_kz: 'Қайталама сараптама туралы қаулы' }
                }
              },
              restraint: {
                types: {
                  select: { name_kz: 'Бұлтартпау шарасын таңдау туралы қаулы' },
                  change: { name_kz: 'Бұлтартпау шарасын өзгерту туралы қаулы' },
                  cancel: { name_kz: 'Бұлтартпау шарасын жою туралы қаулы' }
                }
              },
              restrictions: {
                types: {
                  arrest: { name_kz: 'Мүлікке арест қою туралы қаулы' },
                  suspension: { name_kz: 'Лауазымнан уақытша шеттету туралы қаулы' },
                  bring: { name_kz: 'Тұлғаны мәжбүрлеп әкелу (привод) туралы қаулы' }
                }
              },
              case_movement: {
                types: {
                  suspend: { name_kz: 'Тергеуді тоқтата тұру туралы қаулы' },
                  resume: { name_kz: 'Тергеуді қайта бастау туралы қаулы' },
                  split: { name_kz: 'Қылмыстық істі бөлек шығару туралы қаулы' },
                  merge: { name_kz: 'Қылмыстық істерді біріктіру туралы қаулы' }
                }
              },
              completion: {
                types: {
                  procurator: { name_kz: 'Істі прокурорға жолдау туралы қаулы' },
                  indictment: { name_kz: 'Айыптау актісін жасау туралы қаулы' }
                }
              }
            }
          };
        }
        if (url.includes('/api/resolutions/')) {
          const id = url.split('/api/resolutions/')[1];
          const resos = JSON.parse(localStorage.getItem('demo_resolutions') || '[]');
          return { resolution: resos.find(r => r.id.toString() === id.toString()) };
        }
        if (url.includes('/api/resolutions')) return { resolutions: JSON.parse(localStorage.getItem('demo_resolutions') || '[]') };
        if (url.includes('/api/auth/me')) return { user: JSON.parse(localStorage.getItem('tergeu_demo_user')) };
      }

      if (options.method === 'POST') {
        if (url.includes('/api/resolutions/generate')) {
          const body = JSON.parse(options.body);
          const cases = JSON.parse(localStorage.getItem('demo_cases') || '[]');
          const c = cases.find(item => item.id.toString() === body.case_id.toString());
          let content = '';
          const isGold = c?.case_number === '237856421003';
          const isProtocol = (body.resolution_type || '').toLowerCase().includes('жауап алу') || (body.resolution_type || '').toLowerCase().includes('хаттамасы');
          if (isGold) {
            if (isProtocol) {
              content = `Жәбірленушіден (куәдан) жауап алу\nХ А Т Т А М А С Ы\n\nАстана қаласы                                                                «15» наурыз 2025 жыл\n\nЖауап алудың басталуы: 10 сағ. 15 мин.\nАяқталуы: 11 сағ. 05 мин.\n\nАстана қаласы «Алматы» ІІБ АПБ ТБ тергеушісі полиция лейтенанты Л.А. Жаугаштиева, ҚР ҚПК-нің 115, 199, 214, 78-баптарына сәйкес жәбірленуші (куә) ретінде жауап алды:\n\nТегі, аты, әкесінің аты: ${GOLD_CASE_DATA.victim.name}\nТуған жылы: ${GOLD_CASE_DATA.victim.birth}\nТуған жері: ${GOLD_CASE_DATA.victim.place}\nҰлты: ${GOLD_CASE_DATA.victim.nationality}\nАзаматтық жайы: ${GOLD_CASE_DATA.victim.citizenship}\nБілімі: ${GOLD_CASE_DATA.victim.education}\nОтбасы жайы: ${GOLD_CASE_DATA.victim.family}\nЖұмыс орны және қызметі: ${GOLD_CASE_DATA.victim.work}\nТөл құжаттары: ${GOLD_CASE_DATA.victim.id_card}\nМекен-жайы: ${GOLD_CASE_DATA.victim.address}\nСотталғандығы туралы мәліметтер: ${GOLD_CASE_DATA.victim.record}\nТел: ${GOLD_CASE_DATA.victim.phone}\n\nҚР ҚПК-нің 420, 421 баптарында көрсетілген жәбірленушіның (куәның) құқықтары мен міндеттері түсіндірілді және жалған жауап бергені үшін немесе жауап беруден бас тартқаны үшін, ол ҚР ҚК-нің 419-бабы бойынша қылмыстық жауапқа тартылатыны ескертілді\n\nЖәбірленуші (Куә) _____________ (қолы)\n\nОны жауап алуға шақырған себептер жайлы айтып беруді ұсынғанда жәбірленуші (куә) жауапты өз ана тілімде беретінін, аудармашының қажеті жоқтығын көрсетті.\n\nЖәбірленуші (Куә) _____________ (қолы)\n\n${GOLD_CASE_DATA.narrative_kz}\n\nЖәбірленуші (Куә): _____________ /Серікбаев Н.Е./\n\nТергеуші: _____________ /Жаугаштиева Л.А./`;
            } else {
              content = `Жәбірленуші деп тану туралы\nҚАУЛЫ\n\n«15» наурыз 2025 жыл\nАстана қаласы\n\nАстана қаласы Алматы АІІБ-ның АПБ-нің ТБ-нің тергеушісі полиция аға лейтенанты Л.А. Жаугаштиева, №${GOLD_CASE_DATA.resolution_case_number} санды қылмыстық іс құжат материалдарын қарап,\n\nА Н Ы Қ Т А Л Д Ы:\n\n${GOLD_CASE_DATA.resolution_determination_kz}\n\nҚПК-нің 71, 198-баптарын басшылыққа ала отырып,\n\nҚ А У Л Ы   Е Т Т І М:\n\n• Серікбаев Нұржан Ермекұлы, осы сотқа дейінгі іс жүргізу материалдары бойынша жәбірленуші деп танылсын, ол туралы қол қойып хабарласын.\n\n• Жәбірленушіге ҚПК-ның 71-бабында көзделген құқықтары мен міндеттері түсіндірілсін.\n\n• Осы қаулының көшірмесі прокурорға жіберілсін.\n\n⸻\n\nЖәбірленушінің құқықтары мен міндеттері түсіндірілді.\n\nЖәбірленуші: _____________ (қолы)\n\n⸻\n\nАстана қаласы Алматы АІІБ-ның АПБ-нің ТБ-нің\nтергеушісі полиция аға лейтенанты _____________ /Л.А. Жаугаштиева/`;
            }
          } else {
            content = `Постановление: ${body.resolution_type}\nНомер дела: ${c?.case_number}\nСледователь: ${user?.full_name}\n\nДанные документа будут заполнены согласно стандартам.`;
          }
          const newRes = { id: Date.now(), case_number: c?.case_number, resolution_type: body.resolution_type, status: 'draft', language: body.language || 'kz', created_at: new Date().toISOString(), content };
          const resos = JSON.parse(localStorage.getItem('demo_resolutions') || '[]');
          localStorage.setItem('demo_resolutions', JSON.stringify([newRes, ...resos]));
          return { resolution: newRes };
        }
      }
      return {};
    }
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { ...options, headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const apiDownload = async (url, filename) => {
    if (isDemo) { showToast('Загрузка недоступна в демо-режиме', 'warning'); return; }
    const headers = {}; if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(url, { headers });
    const blob = await res.blob();
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = filename; link.click(); URL.revokeObjectURL(link.href);
  };

  const showToast = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    const initAuth = async () => {
      if (token && isDemo) {
        const storedUser = JSON.parse(localStorage.getItem('tergeu_demo_user'));
        if (storedUser) setUser(storedUser); else logout();
      } else if (token && !isDemo) {
        try {
          const res = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setUser(data.user);
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  return (
    <AppContext.Provider value={{ user, token, lang, loading, toast, isDemo, t, switchLang, login, logout, api, apiDownload, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
