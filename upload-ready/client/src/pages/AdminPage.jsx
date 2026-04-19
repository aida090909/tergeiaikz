import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function AdminPage() {
  const { t, api, showToast, lang } = useApp();
  const [stats, setStats] = useState(null);
  const [investigators, setInvestigators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    iin: '', password: '', full_name: '', full_name_kz: '', rank: '', department: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [statsData, invData] = await Promise.all([
        api('/api/admin/stats'),
        api('/api/admin/investigators')
      ]);
      setStats(statsData.stats);
      setInvestigators(invData.investigators || []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api('/api/admin/investigators', { method: 'POST', body: JSON.stringify(form) });
      showToast(t('common.success'), 'success');
      setShowModal(false);
      setForm({ iin: '', password: '', full_name: '', full_name_kz: '', rank: '', department: '' });
      loadData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm(t('admin.delete_confirm'))) return;
    try {
      await api(`/api/admin/investigators/${id}`, { method: 'DELETE' });
      showToast(t('common.success'), 'success');
      loadData();
    } catch (err) { showToast(err.message, 'error'); }
  };

  if (loading) return <div className="loading"><div className="spinner"></div></div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{t('admin.title')}</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="add-investigator-btn">
          <span className="material-icons-outlined" style={{fontSize:18}}>person_add</span>
          {t('admin.add_investigator')}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon blue">
              <span className="material-icons-outlined">people</span>
            </div>
            <div>
              <div className="stat-card-value">{stats.totalInvestigators}</div>
              <div className="stat-card-label">{t('admin.total_investigators')}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon green">
              <span className="material-icons-outlined">folder_open</span>
            </div>
            <div>
              <div className="stat-card-value">{stats.totalCases}</div>
              <div className="stat-card-label">{t('admin.total_cases')}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon gold">
              <span className="material-icons-outlined">description</span>
            </div>
            <div>
              <div className="stat-card-value">{stats.totalResolutions}</div>
              <div className="stat-card-label">{t('admin.total_resolutions')}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon teal">
              <span className="material-icons-outlined">verified</span>
            </div>
            <div>
              <div className="stat-card-value">{stats.activeCases}</div>
              <div className="stat-card-label">{t('admin.active_cases')}</div>
            </div>
          </div>
        </div>
      )}

      {/* Investigators Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">{t('nav.investigators')}</div>
        </div>
        {investigators.length === 0 ? (
          <div style={{textAlign:'center', padding:30, color:'var(--text-muted)'}}>
            {t('common.no_data')}
          </div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.full_name')}</th>
                  <th>{t('admin.iin')}</th>
                  <th>{t('admin.rank')}</th>
                  <th>{t('admin.department')}</th>
                  <th>{t('admin.cases_count')}</th>
                  <th>{t('admin.resolutions_count')}</th>
                  <th>{t('admin.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {investigators.map(inv => (
                  <tr key={inv.id}>
                    <td style={{fontWeight:500}}>
                      {lang === 'kz' ? (inv.full_name_kz || inv.full_name) : inv.full_name}
                    </td>
                    <td style={{fontFamily:'monospace'}}>{inv.iin}</td>
                    <td>{inv.rank || '—'}</td>
                    <td>{inv.department || '—'}</td>
                    <td>
                      <span style={{background:'rgba(0,136,255,0.08)', color:'var(--primary)', padding:'2px 8px', borderRadius:'var(--radius-full)', fontWeight:600, fontSize:'var(--font-sm)'}}>
                        {inv.case_count}
                      </span>
                    </td>
                    <td>
                      <span style={{background:'rgba(0,196,140,0.08)', color:'var(--accent-green)', padding:'2px 8px', borderRadius:'var(--radius-full)', fontWeight:600, fontSize:'var(--font-sm)'}}>
                        {inv.resolution_count}
                      </span>
                    </td>
                    <td>
                      <button className="btn-icon" onClick={() => handleDelete(inv.id)}
                        style={{color:'var(--accent-red)'}} title={t('admin.delete')}>
                        <span className="material-icons-outlined" style={{fontSize:18}}>delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{t('admin.add_investigator')}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <span className="material-icons-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('admin.iin')} *</label>
                    <input className="form-input" value={form.iin}
                      onChange={e => setForm({...form, iin: e.target.value.replace(/\D/g, '').slice(0, 12)})}
                      placeholder="123456789012" maxLength={12} required id="inv-iin-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.password')} *</label>
                    <input type="password" className="form-input" value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})}
                      required id="inv-password-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.full_name')} *</label>
                  <input className="form-input" value={form.full_name}
                    onChange={e => setForm({...form, full_name: e.target.value})}
                    placeholder="Иванов Иван Иванович" required id="inv-name-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('admin.full_name_kz')}</label>
                  <input className="form-input" value={form.full_name_kz}
                    onChange={e => setForm({...form, full_name_kz: e.target.value})}
                    placeholder="Иванов Иван Иванұлы" id="inv-name-kz-input" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">{t('admin.rank')}</label>
                    <input className="form-input" value={form.rank}
                      onChange={e => setForm({...form, rank: e.target.value})}
                      placeholder="" id="inv-rank-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('admin.department')}</label>
                    <input className="form-input" value={form.department}
                      onChange={e => setForm({...form, department: e.target.value})}
                      placeholder="" id="inv-dept-input" />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  {t('common.cancel')}
                </button>
                <button type="submit" className="btn btn-primary" id="save-investigator-btn">
                  <span className="material-icons-outlined" style={{fontSize:18}}>person_add</span>
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
