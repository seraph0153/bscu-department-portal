import React, { useState } from 'react';
import { 
  Building2, Calendar, Users, FileText, BarChart3, 
  Phone, Mail, MapPin, Search, CheckCircle2, ChevronRight 
} from 'lucide-react';
import './PublicPortal.css';

export default function PublicPortal({ data }) {
  const [activeTab, setActiveTab] = useState('intro');
  const [searchQuery, setSearchQuery] = useState('');

  // 탭 목록 정의
  const tabs = [
    { id: 'intro', name: '부서 소개', icon: Building2 },
    { id: 'history', name: '부서 연혁', icon: Calendar },
    { id: 'org', name: '조직 및 업무분장', icon: Users },
    { id: 'workflow', name: '규정 및 워크플로우', icon: FileText },
    { id: 'plan', name: '연간계획 및 성과', icon: BarChart3 },
  ];

  // 1. 조직도 트리 빌더 (간단한 계층형 렌더링)
  const renderOrgTree = (parentId = null) => {
    const children = data.organization.filter(node => node.parentId === parentId);
    if (children.length === 0) return null;

    return (
      <div className="org-children">
        {children.map(node => {
          const isRoot = node.parentId === null;
          const isTeam = node.parentId === '2';
          const cardClass = isRoot ? 'root-node' : (isTeam ? 'team-node' : 'manager-node');
          
          return (
            <div key={node.id} className="org-tree-node">
              <div className={`org-card ${cardClass}`}>
                <div className="org-node-icon">
                  <Users size={18} />
                </div>
                <h4 className="org-node-title">{node.name}</h4>
                <p className="org-node-role">{node.role}</p>
              </div>
              {renderOrgTree(node.id)}
            </div>
          );
        })}
      </div>
    );
  };

  // 2. 업무분장 필터링
  const filteredDuties = data.duties.filter(duty => 
    duty.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    duty.task.toLowerCase().includes(searchQuery.toLowerCase()) ||
    duty.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. KPI 진척률 계산 유틸
  const getKpiPercentage = (actualStr, targetStr) => {
    const actualNum = parseFloat(actualStr.replace(/[^0-9.]/g, ''));
    const targetNum = parseFloat(targetStr.replace(/[^0-9.]/g, ''));
    if (isNaN(actualNum) || isNaN(targetNum)) return 0;
    return Math.min(100, Math.round((actualNum / targetNum) * 100));
  };

  return (
    <div className="public-portal animate-fade-in">
      {/* 히어로 영역 */}
      <div className="portal-hero">
        <div className="hero-content">
          <span className="hero-tag">{data.parentDepartment}</span>
          <h2 className="hero-title">{data.departmentName}</h2>
          <p className="hero-subtitle">{data.englishName}</p>
          <div className="hero-badge-container">
            <span className="badge badge-primary">원장 연동형</span>
            <span className="badge badge-success">공개 정보</span>
          </div>
        </div>
        <div style={{ zIndex: 2 }}>
          <Building2 size={80} style={{ opacity: 0.15, transform: 'rotate(-10deg)' }} />
        </div>
      </div>

      {/* 탭 인터페이스 */}
      <div className="portal-tabs">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <Icon size={16} />
                {tab.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* 탭 본문 내용 */}
      <div className="tab-content">
        {/* [소개 탭] */}
        {activeTab === 'intro' && (
          <div className="intro-grid">
            <div className="premium-card greeting-card">
              <h3 className="greeting-title">{data.managerTitle}</h3>
              <p className="greeting-text">{data.managerGreeting}</p>
            </div>
            
            <div className="premium-card contact-card">
              <div>
                <h3 className="contact-title">
                  <Phone size={18} style={{ color: 'var(--primary-light)' }} />
                  대표 연락처 및 위치
                </h3>
                <div className="contact-list">
                  <div className="contact-item">
                    <div className="contact-icon"><Phone size={16} /></div>
                    <div>
                      <span className="contact-label">전화번호</span>
                      <span className="contact-val">{data.contact.phone}</span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon"><Mail size={16} /></div>
                    <div>
                      <span className="contact-label">이메일</span>
                      <span className="contact-val">{data.contact.email}</span>
                    </div>
                  </div>
                  <div className="contact-item">
                    <div className="contact-icon"><MapPin size={16} /></div>
                    <div>
                      <span className="contact-label">부서 위치</span>
                      <span className="contact-val">{data.contact.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="contact-image-wrapper">
                <img 
                  src={data.representativeImage} 
                  alt="산학협력단 업무 전경" 
                  className="contact-image" 
                />
              </div>
            </div>
          </div>
        )}

        {/* [연혁 탭] */}
        {activeTab === 'history' && (
          <div className="timeline-container">
            <div className="timeline-line"></div>
            {data.history.map(item => (
              <div key={item.id} className="timeline-item">
                <div className="timeline-badge"></div>
                <div className="premium-card timeline-content-card">
                  <h4 className="timeline-year">{item.year}</h4>
                  <p className="timeline-title" style={{ color: 'var(--accent)' }}>{item.date} — {item.title}</p>
                  <p className="timeline-desc">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* [조직도 및 업무분장 탭] */}
        {activeTab === 'org' && (
          <div>
            <div className="premium-card" style={{ padding: '2rem', marginBottom: '2.5rem', overflow: 'auto' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem' }}>부서 조직도</h3>
              <div className="org-container">
                {renderOrgTree(null)}
              </div>
            </div>

            <div className="premium-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>직무 및 업무분장</h3>
              <div className="duties-search-bar">
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="업무명, 담당자 또는 키워드로 검색하세요..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="premium-table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>업무 분류</th>
                      <th style={{ width: '50%' }}>담당 업무 내용</th>
                      <th style={{ width: '30%' }}>담당 부서원</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDuties.length > 0 ? (
                      filteredDuties.map(duty => (
                        <tr key={duty.id}>
                          <td style={{ fontWeight: 600 }}>{duty.category}</td>
                          <td>{duty.task}</td>
                          <td style={{ color: 'var(--text-secondary)' }}>{duty.manager}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                          검색 결과와 일치하는 업무 내역이 없습니다.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* [규정 및 워크플로우 탭] */}
        {activeTab === 'workflow' && (
          <div className="workflow-section">
            {data.workflows.map(flow => {
              const rule = data.regulations.find(r => r.code === flow.ruleCode);
              return (
                <div key={flow.id} className="premium-card workflow-card">
                  <div className="workflow-header">
                    <h3 className="workflow-title">{flow.name}</h3>
                    {rule && (
                      <span className="workflow-rule-tag">
                        근거 규정:{' '}
                        {rule.url ? (
                          <a 
                            href={rule.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            style={{ color: 'var(--primary-light)', textDecoration: 'underline', fontWeight: 'bold' }}
                          >
                            {rule.name}
                          </a>
                        ) : (
                          <strong>{rule.name}</strong>
                        )}{' '}
                        ({rule.code})
                      </span>
                    )}
                  </div>
                  
                  <div className="workflow-steps-flow">
                    {flow.steps.map((stepNode, idx) => (
                      <React.Fragment key={stepNode.step}>
                        <div className="workflow-step-box">
                          <div className="step-num-badge">{stepNode.step}</div>
                          <h4 className="step-box-name">{stepNode.name}</h4>
                          <p className="step-box-actor">{stepNode.actor}</p>
                          <p className="step-box-desc">{stepNode.desc}</p>
                        </div>
                        {idx < flow.steps.length - 1 && (
                          <div className="org-connector-down" style={{ display: 'none' }}></div> /* 모바일 대응용 */
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* [연간계획 및 성과 탭] */}
        {activeTab === 'plan' && (
          <div className="plan-kpi-grid">
            <div className="premium-card plan-section">
              <div className="plan-title-wrapper">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span className="plan-year-badge">{data.annualPlan.year}년도</span>
                  {data.annualPlan.reportUrl && (
                    <a 
                      href={data.annualPlan.reportUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="badge badge-success"
                      style={{ textDecoration: 'underline', cursor: 'pointer' }}
                    >
                      대학 자체평가 보고서 원문 📄
                    </a>
                  )}
                </div>
                <h3 className="plan-target">{data.annualPlan.target}</h3>
              </div>
              
              <div style={{ marginBottom: '2rem' }}>
                <h4 className="plan-list-title">중점 추진 사업</h4>
                <ul className="plan-items">
                  {data.annualPlan.projects.map((proj, idx) => (
                    <li key={idx} className="plan-item-li">
                      <CheckCircle2 size={16} />
                      <span>{proj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="plan-schedule-card">
                <h4 className="plan-schedule-title">추진 일정</h4>
                <p className="plan-schedule-text">{data.annualPlan.schedule}</p>
              </div>
            </div>

            <div className="premium-card kpi-section">
              <h3 className="kpi-title">주요 성과 지표 (KPI)</h3>
              <div className="kpi-list">
                {data.kpis.map(kpi => {
                  const percentage = getKpiPercentage(kpi.actual, kpi.target);
                  return (
                    <div key={kpi.id} className="kpi-progress-item">
                      <div className="kpi-info-row">
                        <span className="kpi-name-label">{kpi.name}</span>
                        <span className="kpi-values">
                          실적 <span className="kpi-actual-val">{kpi.actual}</span> / 목표 {kpi.target}
                        </span>
                      </div>
                      <div className="kpi-progress-bg">
                        <div 
                          className="kpi-progress-bar" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        달성률 {percentage}% (기준일: {kpi.date})
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
