import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Globe, LayoutDashboard, Building2, HelpCircle 
} from 'lucide-react';
import PublicPortal from './components/PublicPortal';
import AdminConsole from './components/AdminConsole';
import { initialDepartmentData, initialLogs } from './data/mockData';
import './App.css';

function App() {
  // 1. 상태 정의 (공개 원장 데이터 및 감사 로그)
  const [departmentData, setDepartmentData] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_department_data_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 필수 필드 구조 검증 및 병합
        return {
          ...initialDepartmentData,
          ...parsed,
          contact: { ...initialDepartmentData.contact, ...(parsed.contact || {}) },
          annualPlan: { ...initialDepartmentData.annualPlan, ...(parsed.annualPlan || {}) }
        };
      }
    } catch (e) {
      console.error("Failed to load department data from localStorage:", e);
    }
    return initialDepartmentData;
  });

  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_system_logs_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load logs from localStorage:", e);
    }
    return initialLogs;
  });

  // 2. 화면 보기 모드 (portal: 사용자 화면, admin: 관리자 화면)
  const [viewMode, setViewMode] = useState('portal');

  // 3. 다크/라이트 테마 제어
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nexus_theme_v2') || 'light';
  });

  // 데이터 로컬 보존 동기화
  useEffect(() => {
    localStorage.setItem('nexus_department_data_v2', JSON.stringify(departmentData));
  }, [departmentData]);

  useEffect(() => {
    localStorage.setItem('nexus_system_logs_v2', JSON.stringify(logs));
  }, [logs]);

  // 테마 상태 반영
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nexus_theme_v2', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="app-container">
      {/* 글로벌 상단 헤더 */}
      <header className="app-header">
        <div className="header-logo-group">
          <div className="logo-icon">
            <Building2 size={20} />
          </div>
          <div>
            <span className="logo-text gradient-title">NEXUS UNI</span>
            <span style={{ fontSize: '0.75rem', display: 'block', color: 'var(--text-muted)', marginTop: '-2px', fontWeight: 600 }}>
              부서 정보 통합 관리 시스템 v2.1
            </span>
          </div>
        </div>

        {/* 제어 패널 (화면 모드 스위처 & 테마 토글) */}
        <div className="header-controls">
          <div className="view-mode-tabs">
            <button 
              className={`view-mode-btn ${viewMode === 'portal' ? 'active' : ''}`}
              onClick={() => setViewMode('portal')}
            >
              <Globe size={15} />
              사용자 포털
            </button>
            <button 
              className={`view-mode-btn ${viewMode === 'admin' ? 'active' : ''}`}
              onClick={() => setViewMode('admin')}
            >
              <LayoutDashboard size={15} />
              관리자 콘솔
            </button>
          </div>

          <button className="theme-toggle-btn" onClick={toggleTheme} title="화면 테마 전환">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="app-main">
        {viewMode === 'portal' ? (
          <PublicPortal data={departmentData} />
        ) : (
          <AdminConsole 
            currentData={departmentData} 
            setDepartmentData={setDepartmentData}
            logs={logs}
            setLogs={setLogs}
          />
        )}
      </main>

      {/* 푸터 */}
      <footer className="app-footer">
        <p>© 2026 백석문화대학교. All Rights Reserved. 본 시스템은 넥서스 유니 연동 규격 및 고등교육기관 정보공시법을 준수합니다.</p>
      </footer>
    </div>
  );
}

export default App;
