import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ProfilePage() {
  const { user, lang, t, showToast } = useApp();
  const [avatar, setAvatar] = useState(localStorage.getItem('tergeu_avatar') || null);
  
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        localStorage.setItem('tergeu_avatar', reader.result);
        showToast(lang === 'kz' ? 'Фото сәтті жаңартылды' : 'Фото успешно обновлено', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const userName = lang === 'kz' ? (user?.full_name_kz || user?.full_name) : user?.full_name;

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1 className="page-title">{lang === 'kz' ? 'Пайдаланушы профилі' : 'Профиль пользователя'}</h1>
      </div>

      <div className="card" style={{maxWidth: 800, margin: '0 auto'}}>
        <div className="profile-header-large">
          <div className="profile-avatar-xl">
            {avatar ? (
              <img src={avatar} alt="Avatar" />
            ) : (
              <div className="profile-avatar-placeholder-xl">
                {userName?.charAt(0) || 'И'}
              </div>
            )}
            <label className="change-photo-fab">
              <span className="material-icons-outlined">photo_camera</span>
              <input type="file" hidden accept="image/*" onChange={handlePhotoChange} />
            </label>
          </div>
          <div className="profile-titles-xl">
            <h2>{userName}</h2>
            <div className="rank-tag">{user?.rank}</div>
          </div>
        </div>

        <div className="profile-details-grid">
          <div className="detail-item">
            <div className="detail-label">{lang === 'kz' ? 'ЖСН' : 'ИИН'}</div>
            <div className="detail-value">{user?.iin || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">{lang === 'kz' ? 'Атағы' : 'Звание'}</div>
            <div className="detail-value">{user?.rank || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">{lang === 'kz' ? 'Рөлі' : 'Роль'}</div>
            <div className="detail-value">{user?.role === 'admin' ? (lang === 'kz' ? 'Әкімші' : 'Администратор') : (lang === 'kz' ? 'Тергеуші' : 'Следователь')}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">{lang === 'kz' ? 'Бөлімше' : 'Подразделение'}</div>
            <div className="detail-value">{user?.department || '—'}</div>
          </div>
          <div className="detail-item full-width">
            <div className="detail-label">{lang === 'kz' ? 'Толық аты-жөні' : 'Полное имя'}</div>
            <div className="detail-value">{lang === 'kz' ? (user?.full_name_kz || user?.full_name || '—') : (user?.full_name || '—')}</div>
          </div>
        </div>
      </div>
      
      <style>{`
        .profile-page {
          animation: fadeIn 0.4s ease;
        }
        .profile-header-large {
          display: flex;
          align-items: center;
          gap: 32px;
          padding: 32px;
          border-bottom: 1px solid var(--border-light);
          flex-wrap: wrap;
        }
        .profile-avatar-xl {
          position: relative;
          width: 150px;
          height: 150px;
        }
        .profile-avatar-xl img {
          width: 100%;
          height: 100%;
          border-radius: var(--radius-lg);
          object-fit: cover;
          box-shadow: var(--shadow-md);
        }
        .profile-avatar-placeholder-xl {
          width: 100%;
          height: 100%;
          border-radius: var(--radius-lg);
          background: var(--primary-gradient);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          font-weight: 800;
        }
        .change-photo-fab {
          position: absolute;
          bottom: -10px;
          right: -10px;
          width: 40px;
          height: 40px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow-lg);
          transition: transform 0.2s;
        }
        .change-photo-fab:hover { transform: scale(1.1); }
        .profile-titles-xl h2 { margin: 0; font-size: 28px; fontWeight: 800; color: var(--text-primary); }
        .rank-tag {
          display: inline-block;
          margin-top: 8px;
          padding: 6px 16px;
          background: rgba(0, 136, 255, 0.1);
          color: var(--primary);
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 14px;
        }
        .profile-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          padding: 32px;
        }
        .detail-item.full-width { grid-column: span 2; }
        .detail-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .detail-value { font-size: 18px; color: var(--text-primary); font-weight: 600; }
        @media (max-width: 600px) {
          .profile-details-grid { grid-template-columns: 1fr; }
          .detail-item.full-width { grid-column: span 1; }
          .profile-header-large { justify-content: center; text-align: center; }
        }
      `}</style>
    </div>
  );
}
