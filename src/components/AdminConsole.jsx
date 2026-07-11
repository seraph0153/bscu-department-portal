import React, { useState, useEffect } from 'react';
import { 
  Shield, CheckSquare, Edit, List, Share2, ClipboardList, 
  Play, Save, CheckCircle, XCircle, RotateCcw, AlertTriangle, HelpCircle,
  Building2, Calendar, Users
} from 'lucide-react';
import './AdminConsole.css';

export default function AdminConsole({ currentData, setDepartmentData, logs, setLogs }) {
  // 1. 역할 세션 설정
  const [currentRole, setCurrentRole] = useState('editor'); // editor, reviewer, approver, auditor
  const [activeMenu, setActiveMenu] = useState('info'); // info, timeline, org, duties, approval, logs

  // 2. 결재 프로세스 상태 관리
  const [systemStatus, setSystemStatus] = useState('PUBLISHED'); // DRAFT, IN_REVIEW, APPROVED, PUBLISHED
  const [draftData, setDraftData] = useState({ ...currentData }); // 편집자용 임시 버퍼
  const [pendingData, setPendingData] = useState(null); // 결재 진행 데이터 버퍼
  
  const [reviewerOpinion, setReviewerOpinion] = useState('');
  const [approverOpinion, setApproverOpinion] = useState('');

  // 3. 입력 보조 임시 State
  const [newHistory, setNewHistory] = useState({ year: '', date: '', title: '', desc: '' });
  const [newOrgNode, setNewOrgNode] = useState({ name: '', role: '', parentId: '2' });
  const [newDuty, setNewDuty] = useState({ category: '', task: '', manager: '' });

  // 실제 데이터 변경 시 임시 버퍼 동기화
  useEffect(() => {
    if (systemStatus === 'PUBLISHED') {
      setDraftData({ ...currentData });
    }
  }, [currentData, systemStatus]);

  // 이력 기록 헬퍼
  const addLog = (actor, type, reason, details, snapshot = null) => {
    const newLog = {
      id: `log-${Date.now()}`,
      time: new Date().toISOString(),
      actor,
      type,
      reason,
      details,
      snapshot: snapshot ? JSON.parse(JSON.stringify(snapshot)) : null
    };
    setLogs(prev => [newLog, ...prev]);
  };

  // 4. 편집자 기능
  const handleInputChange = (field, value) => {
    setDraftData(prev => ({
      ...prev,
      [field]: value
    }));
    setSystemStatus('DRAFT');
  };

  const handleContactChange = (field, value) => {
    setDraftData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
    setSystemStatus('DRAFT');
  };

  const handleSaveDraft = () => {
    addLog('부서편집자 (u10231)', 'DRAFT', '초안 임시저장', '기초 공개 데이터 수정 진행 중');
    alert('초안이 관리자 백단 세션에 안전하게 저장되었습니다 (상태: DRAFT)');
  };

  const handleRequestReview = () => {
    setPendingData({ ...draftData });
    setSystemStatus('IN_REVIEW');
    addLog(
      '부서편집자 (u10231)', 
      'DRAFT_SUBMIT', 
      '부서 공개정보 수정 검토 요청', 
      '조직도, 연혁 및 연간 계획 수정본에 대한 검토 요청서 제출',
      draftData
    );
    alert('부서검토자에게 결재 요청이 전송되었습니다 (상태: IN_REVIEW)');
    setActiveMenu('approval');
  };

  // 5. 검토자 기능
  const handleReviewApprove = () => {
    setSystemStatus('APPROVED');
    addLog(
      '부서검토자 (u09420)', 
      'REVIEW_COMPLETE', 
      '검토 완료 및 승인자 전달', 
      `검토 의견: ${reviewerOpinion || '이상 없음. 규정 및 개인정보 정밀 대사 완료.'}`
    );
    alert('검토 완료 처리가 되어 기관승인자 결재함으로 이관되었습니다 (상태: APPROVED)');
  };

  const handleReviewReject = () => {
    setSystemStatus('DRAFT');
    addLog(
      '부서검토자 (u09420)', 
      'REVIEW_REJECT', 
      '검토 반려 처리', 
      `반려 사유: ${reviewerOpinion || '내용 보완 필요.'}`
    );
    alert('반려 처리되었습니다. 초안 편집 상태로 회수됩니다.');
  };

  // 6. 승인자 기능
  const handlePublishApprove = () => {
    setDepartmentData({ ...pendingData });
    setSystemStatus('PUBLISHED');
    addLog(
      '기관승인자 (u00011)', 
      'PUBLISH', 
      '최종 배포 승인 (배포 파이프라인 가동)', 
      `승인 의견: ${approverOpinion || '즉시 공시 요망.'} / 메인 포털 배포 완료.`,
      pendingData
    );
    alert('최종 배포 승인되었습니다! 원장 데이터가 갱신되어 사용자 포털에 즉시 배포되었습니다.');
  };

  const handlePublishReject = () => {
    setSystemStatus('DRAFT');
    addLog(
      '기관승인자 (u00011)', 
      'PUBLISH_REJECT', 
      '배포 승인 반려', 
      `반려 사유: ${approverOpinion || '부서 계획 재조정 필요.'}`
    );
    alert('승인 반려 처리되었습니다. 초안 상태로 회수됩니다.');
  };

  // 7. 롤백 기능 (감사자)
  const handleRollback = (targetLog) => {
    if (!targetLog.snapshot) {
      alert('해당 로그 시점에는 롤백 가능한 데이터 스냅샷이 존재하지 않습니다.');
      return;
    }
    if (window.confirm(`${targetLog.time.split('T')[0]} 시점의 원장 데이터 스냅샷으로 롤백하시겠습니까?`)) {
      setDepartmentData({ ...targetLog.snapshot });
      setDraftData({ ...targetLog.snapshot });
      setSystemStatus('PUBLISHED');
      addLog(
        '감사자 (u_auditor)', 
        'ROLLBACK', 
        '원장 데이터 과거 시점 롤백 수행', 
        `롤백 대상 로그 ID: ${targetLog.id}`
      );
      alert('선택한 과거 버전으로 전체 부서 공개정보 원장이 복구 및 재배포되었습니다.');
    }
  };

  // 8. 서브 리스트 제어 (연혁, 조직도, 업무분장)
  const handleAddHistory = () => {
    if (!newHistory.year || !newHistory.title) return alert('연도와 연혁 타이틀은 필수 입력사항입니다.');
    const updatedHistory = [
      ...draftData.history,
      { id: `h-${Date.now()}`, ...newHistory }
    ].sort((a, b) => b.year.localeCompare(a.year)); // 최신 연도순 정렬

    setDraftData(prev => ({ ...prev, history: updatedHistory }));
    setSystemStatus('DRAFT');
    setNewHistory({ year: '', date: '', title: '', desc: '' });
  };

  const handleRemoveHistory = (id) => {
    setDraftData(prev => ({
      ...prev,
      history: prev.history.filter(h => h.id !== id)
    }));
    setSystemStatus('DRAFT');
  };

  const handleAddOrgNode = () => {
    if (!newOrgNode.name || !newOrgNode.role) return alert('이름과 역할은 필수 입력사항입니다.');
    const updatedOrg = [
      ...draftData.organization,
      { id: `org-${Date.now()}`, ...newOrgNode }
    ];
    setDraftData(prev => ({ ...prev, organization: updatedOrg }));
    setSystemStatus('DRAFT');
    setNewOrgNode({ name: '', role: '', parentId: '2' });
  };

  const handleRemoveOrgNode = (id) => {
    if (id === '1' || id === '2') return alert('기본 상위 직제 노드는 삭제할 수 없습니다.');
    setDraftData(prev => ({
      ...prev,
      organization: prev.organization.filter(o => o.id !== id)
    }));
    setSystemStatus('DRAFT');
  };

  const handleAddDuty = () => {
    if (!newDuty.category || !newDuty.task) return alert('분류와 상세 업무 내용은 필수 입력사항입니다.');
    const updatedDuties = [
      ...draftData.duties,
      { id: `d-${Date.now()}`, ...newDuty }
    ];
    setDraftData(prev => ({ ...prev, duties: updatedDuties }));
    setSystemStatus('DRAFT');
    setNewDuty({ category: '', task: '', manager: '' });
  };

  const handleRemoveDuty = (id) => {
    setDraftData(prev => ({
      ...prev,
      duties: prev.duties.filter(d => d.id !== id)
    }));
    setSystemStatus('DRAFT');
  };

  // 9. 변경사항 Diff 감지기
  const getChangedFields = () => {
    const compareTarget = pendingData || draftData;
    const changed = [];

    if (!compareTarget || !currentData) return changed;

    if (currentData.managerTitle !== compareTarget.managerTitle) changed.push({ name: '부서장 인사말 제목', oldVal: currentData.managerTitle, newVal: compareTarget.managerTitle });
    if (currentData.managerGreeting !== compareTarget.managerGreeting) changed.push({ name: '부서장 인사말 본문', oldVal: currentData.managerGreeting?.substring(0, 40) + '...', newVal: compareTarget.managerGreeting?.substring(0, 40) + '...' });
    if (currentData.contact?.phone !== compareTarget.contact?.phone) changed.push({ name: '대표 전화번호', oldVal: currentData.contact?.phone, newVal: compareTarget.contact?.phone });
    if (currentData.contact?.email !== compareTarget.contact?.email) changed.push({ name: '대표 이메일', oldVal: currentData.contact?.email, newVal: compareTarget.contact?.email });
    if (currentData.contact?.location !== compareTarget.contact?.location) changed.push({ name: '사무실 위치', oldVal: currentData.contact?.location, newVal: compareTarget.contact?.location });
    
    // 리스트 길이 변화 감지
    if (currentData.history?.length !== compareTarget.history?.length) changed.push({ name: '연혁 정보', oldVal: `${currentData.history?.length || 0}건 등록`, newVal: `${compareTarget.history?.length || 0}건 등록` });
    if (currentData.organization?.length !== compareTarget.organization?.length) changed.push({ name: '조직도 구성원', oldVal: `${currentData.organization?.length || 0}명 등록`, newVal: `${compareTarget.organization?.length || 0}명 등록` });
    if (currentData.duties?.length !== compareTarget.duties?.length) changed.push({ name: '업무분장 건수', oldVal: `${currentData.duties?.length || 0}건`, newVal: `${compareTarget.duties?.length || 0}건` });

    return changed;
  };

  const changes = getChangedFields();

  return (
    <div className="admin-console">
      {/* 1. 사이드 바 */}
      <div className="premium-card admin-sidebar">
        <h3 className="sidebar-title">
          <Shield size={18} />
          부서 관리자 시스템
        </h3>

        {/* 권한 전환 스위치 (SSO 대용) */}
        <div className="form-group">
          <label className="form-label" style={{ fontSize: '0.75rem' }}>SSO 연동 역할 전환</label>
          <div className="role-selector-group">
            <button 
              className={`role-btn ${currentRole === 'editor' ? 'active' : ''}`}
              onClick={() => { setCurrentRole('editor'); setActiveMenu('info'); }}
            >
              <div>
                <span className="role-btn-subtext">작성 권한</span>
                부서편집자 (u10231)
              </div>
              <Edit size={14} />
            </button>
            <button 
              className={`role-btn ${currentRole === 'reviewer' ? 'active' : ''}`}
              onClick={() => { setCurrentRole('reviewer'); setActiveMenu('approval'); }}
            >
              <div>
                <span className="role-btn-subtext">검토 권한</span>
                부서검토자 (u09420)
              </div>
              <CheckSquare size={14} />
            </button>
            <button 
              className={`role-btn ${currentRole === 'approver' ? 'active' : ''}`}
              onClick={() => { setCurrentRole('approver'); setActiveMenu('approval'); }}
            >
              <div>
                <span className="role-btn-subtext">최종 승인</span>
                기관승인자 (u00011)
              </div>
              <Share2 size={14} />
            </button>
            <button 
              className={`role-btn ${currentRole === 'auditor' ? 'active' : ''}`}
              onClick={() => { setCurrentRole('auditor'); setActiveMenu('logs'); }}
            >
              <div>
                <span className="role-btn-subtext">기록/감사</span>
                시스템감사자 (auditor)
              </div>
              <ClipboardList size={14} />
            </button>
          </div>
        </div>

        {/* 현재 상태 정보판 */}
        <div className="system-status-box">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>공개정보 결재 상태</span>
          <div className="status-indicator">
            <span className={`badge ${
              systemStatus === 'PUBLISHED' ? 'badge-success' : 
              systemStatus === 'IN_REVIEW' ? 'badge-warning' : 'badge-danger'
            }`}>
              {systemStatus}
            </span>
          </div>
        </div>

        {/* 관리 메뉴 */}
        <div className="admin-menu-list-wrapper" style={{ marginTop: '1rem' }}>
          <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '0.5rem', display: 'block' }}>작업 메뉴</label>
          <ul className="admin-menu-list">
            {(currentRole === 'editor' || currentRole === 'auditor') && (
              <>
                <li>
                  <button onClick={() => setActiveMenu('info')} className={`admin-menu-item ${activeMenu === 'info' ? 'active' : ''}`}>
                    <Building2 size={16} /> 부서 기본정보 편집
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveMenu('timeline')} className={`admin-menu-item ${activeMenu === 'timeline' ? 'active' : ''}`}>
                    <Calendar size={16} /> 부서 연혁 편집
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveMenu('org')} className={`admin-menu-item ${activeMenu === 'org' ? 'active' : ''}`}>
                    <Users size={16} /> 조직도 트리 편집
                  </button>
                </li>
                <li>
                  <button onClick={() => setActiveMenu('duties')} className={`admin-menu-item ${activeMenu === 'duties' ? 'active' : ''}`}>
                    <List size={16} /> 직무 및 업무분장 편집
                  </button>
                </li>
              </>
            )}
            <li>
              <button onClick={() => setActiveMenu('approval')} className={`admin-menu-item ${activeMenu === 'approval' ? 'active' : ''}`}>
                <CheckSquare size={16} /> 결재 승인함 & Diff 뷰
              </button>
            </li>
            <li>
              <button onClick={() => setActiveMenu('logs')} className={`admin-menu-item ${activeMenu === 'logs' ? 'active' : ''}`}>
                <ClipboardList size={16} /> 감사 로그 & 롤백실
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* 2. 메인 패널 */}
      <div className="admin-main-panel">
        {/* [메뉴: 부서 기본정보 편집] */}
        {activeMenu === 'info' && currentRole === 'editor' && (
          <div className="premium-card" style={{ padding: '2rem' }}>
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">부서 기본정보 편집</h3>
              <span className="badge badge-primary">부서편집자 세션</span>
            </div>
            
            <div className="admin-form-grid" style={{ marginTop: '1.5rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">부서명</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={draftData.departmentName}
                    onChange={(e) => handleInputChange('departmentName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">부서 영문명</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={draftData.englishName}
                    onChange={(e) => handleInputChange('englishName', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">부서 요약 및 슬로건</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={draftData.introSummary}
                  onChange={(e) => handleInputChange('introSummary', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">부서장 인사말 헤드라인</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={draftData.managerTitle}
                  onChange={(e) => handleInputChange('managerTitle', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">부서장 인사말 본문</label>
                <textarea 
                  className="form-textarea" 
                  value={draftData.managerGreeting}
                  onChange={(e) => handleInputChange('managerGreeting', e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">대표 전화번호</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={draftData.contact?.phone || ''}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">대표 이메일</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={draftData.contact?.email || ''}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">사무실 대표 위치</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={draftData.contact?.location || ''}
                  onChange={(e) => handleContactChange('location', e.target.value)}
                />
              </div>

              <div className="btn-group">
                <button className="btn btn-secondary" onClick={handleSaveDraft}>
                  <Save size={16} /> 임시저장
                </button>
                <button className="btn btn-primary" onClick={handleRequestReview}>
                  <Play size={16} /> 결재 승인요청
                </button>
              </div>
            </div>
          </div>
        )}

        {/* [메뉴: 부서 연혁 편집] */}
        {activeMenu === 'timeline' && currentRole === 'editor' && (
          <div className="premium-card" style={{ padding: '2rem' }}>
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">부서 연혁 편집</h3>
              <span className="badge badge-primary">부서편집자 세션</span>
            </div>

            {/* 연혁 추가 폼 */}
            <div className="admin-form-grid" style={{ marginTop: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>신규 연혁 추가</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">연도 (YYYY)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예: 2027"
                    value={newHistory.year}
                    onChange={(e) => setNewHistory(prev => ({ ...prev, year: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">상세 월일 (YYYY-MM)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예: 2027-03"
                    value={newHistory.date}
                    onChange={(e) => setNewHistory(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">연혁 명칭 (타이틀)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: RISE 사업 수행 본단 지정"
                  value={newHistory.title}
                  onChange={(e) => setNewHistory(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">상세 내용 기술</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="상세 내용을 적어주세요..."
                  value={newHistory.desc}
                  onChange={(e) => setNewHistory(prev => ({ ...prev, desc: e.target.value }))}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button className="btn btn-primary" onClick={handleAddHistory}>추가하기</button>
              </div>
            </div>

            {/* 현재 임시 연혁 리스트 */}
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>편집 중인 연혁 데이터 목록 ({draftData.history?.length || 0}건)</h4>
              {draftData.history?.map(item => (
                <div key={item.id} className="edit-list-item">
                  <div>
                    <span style={{ fontWeight: 700, color: 'var(--primary-light)', marginRight: '0.5rem' }}>[{item.year}]</span>
                    <strong>{item.title}</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{item.desc}</p>
                  </div>
                  <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleRemoveHistory(item.id)}>삭제</button>
                </div>
              ))}
              <div className="btn-group">
                <button className="btn btn-secondary" onClick={handleSaveDraft}>임시저장</button>
                <button className="btn btn-primary" onClick={handleRequestReview}>결재 승인요청</button>
              </div>
            </div>
          </div>
        )}

        {/* [메뉴: 조직도 트리 편집] */}
        {activeMenu === 'org' && currentRole === 'editor' && (
          <div className="premium-card" style={{ padding: '2rem' }}>
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">조직도 트리 편집</h3>
              <span className="badge badge-primary">부서편집자 세션</span>
            </div>

            {/* 노드 추가 폼 */}
            <div className="admin-form-grid" style={{ marginTop: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>신규 하위 노드 추가</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">이름 / 조직명</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예: 연구비지원센터"
                    value={newOrgNode.name}
                    onChange={(e) => setNewOrgNode(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">담당 업무/역할 요약</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예: 연구 과제 정산 및 협약"
                    value={newOrgNode.role}
                    onChange={(e) => setNewOrgNode(prev => ({ ...prev, role: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">상위 보고 체계 (Parent Node)</label>
                <select 
                  className="form-select"
                  value={newOrgNode.parentId}
                  onChange={(e) => setNewOrgNode(prev => ({ ...prev, parentId: e.target.value }))}
                >
                  {draftData.organization?.map(node => (
                    <option key={node.id} value={node.id}>{node.name} ({node.role})</option>
                  ))}
                </select>
              </div>
              <div style={{ textAlign: 'right' }}>
                <button className="btn btn-primary" onClick={handleAddOrgNode}>노드 추가</button>
              </div>
            </div>

            {/* 노드 목록 */}
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>현재 조직 구성도 목록 ({draftData.organization?.length || 0}개 노드)</h4>
              {draftData.organization?.map(node => {
                const parent = draftData.organization?.find(o => o.id === node.parentId);
                return (
                  <div key={node.id} className="edit-list-item">
                    <div>
                      <strong>{node.name}</strong> <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>— {node.role}</span>
                      {parent && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          상위 체계: {parent.name}
                        </p>
                      )}
                    </div>
                    {node.id !== '1' && node.id !== '2' && (
                      <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleRemoveOrgNode(node.id)}>삭제</button>
                    )}
                  </div>
                );
              })}
              <div className="btn-group">
                <button className="btn btn-secondary" onClick={handleSaveDraft}>임시저장</button>
                <button className="btn btn-primary" onClick={handleRequestReview}>결재 승인요청</button>
              </div>
            </div>
          </div>
        )}

        {/* [메뉴: 업무분장 편집] */}
        {activeMenu === 'duties' && currentRole === 'editor' && (
          <div className="premium-card" style={{ padding: '2rem' }}>
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">직무 및 업무분장 편집</h3>
              <span className="badge badge-primary">부서편집자 세션</span>
            </div>

            {/* 업무 추가 폼 */}
            <div className="admin-form-grid" style={{ marginTop: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700 }}>신규 업무분장 추가</h4>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">업무 대분류</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예: 산학 공동연구"
                    value={newDuty.category}
                    onChange={(e) => setNewDuty(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">실무 담당자 및 내선 정보</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="예: 산학협력팀 홍길동 (내선 123)"
                    value={newDuty.manager}
                    onChange={(e) => setNewDuty(prev => ({ ...prev, manager: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">상세 담당 업무 설명</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="예: RISE 연계 공동 개발사업 과제 관리"
                  value={newDuty.task}
                  onChange={(e) => setNewDuty(prev => ({ ...prev, task: e.target.value }))}
                />
              </div>
              <div style={{ textAlign: 'right' }}>
                <button className="btn btn-primary" onClick={handleAddDuty}>업무 등록</button>
              </div>
            </div>

            {/* 현재 업무분장 목록 */}
            <div style={{ marginTop: '2rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem' }}>현재 편집중인 업무분장 목록 ({draftData.duties?.length || 0}건)</h4>
              {draftData.duties?.map(duty => (
                <div key={duty.id} className="edit-list-item">
                  <div>
                    <span className="badge badge-primary" style={{ marginRight: '0.5rem' }}>{duty.category}</span>
                    <strong>{duty.task}</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>담당자: {duty.manager}</p>
                  </div>
                  <button className="btn btn-danger" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => handleRemoveDuty(duty.id)}>삭제</button>
                </div>
              ))}
              <div className="btn-group">
                <button className="btn btn-secondary" onClick={handleSaveDraft}>임시저장</button>
                <button className="btn btn-primary" onClick={handleRequestReview}>결재 승인요청</button>
              </div>
            </div>
          </div>
        )}

        {/* [메뉴: 결재 승인함 & Diff 뷰] */}
        {activeMenu === 'approval' && (
          <div className="premium-card" style={{ padding: '2rem' }}>
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">결재 승인함 및 변경 비교(Diff)</h3>
              <span className="badge badge-warning">보안 검증 레이어</span>
            </div>

            {systemStatus === 'PUBLISHED' ? (
              <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <CheckCircle size={48} style={{ color: 'var(--success)', marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>대기 중인 결재 문서가 없습니다.</h4>
                <p style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>현재 모든 공개정보가 포털 사이트에 동기화 완료된 상태입니다.</p>
              </div>
            ) : (
              <div style={{ marginTop: '1.5rem' }}>
                {/* 1. 결재 상신 정보 요약 */}
                <div className="premium-card approval-workflow-box" style={{ marginBottom: '2rem' }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    <AlertTriangle size={18} style={{ color: 'var(--warning)' }} />
                    결재 상신 정보
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                    <div>
                      <p><strong>상신 구분:</strong> 부서 공개정보 통합 변경안</p>
                      <p><strong>작성자:</strong> 부서편집자 u10231 (산학협력팀)</p>
                      <p><strong>현재 단계:</strong> {
                        systemStatus === 'IN_REVIEW' ? '부서검토자 검증 단계' : '기관승인자 배포 대기 단계'
                      }</p>
                    </div>
                    <div>
                      <p><strong>상신 시각:</strong> {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                      <p><strong>결재 현황:</strong> {
                        systemStatus === 'IN_REVIEW' ? ' u10231(기안) ➡️ u09420(대기)' : ' u10231(기안) ➡️ u09420(검토완료) ➡️ u00011(최종승인 대기)'
                      }</p>
                    </div>
                  </div>
                </div>

                {/* 2. 기획서 기반 JSON 데이터 시각화 및 Diff 뷰 */}
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>💻 원장 원본 vs 결재 상신본 비교 (Diff)</h4>
                  
                  {changes.length === 0 ? (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>리스트 내 세부 항목 편집 외에, 기본 텍스트에 대한 변경 내역은 없습니다.</p>
                  ) : (
                    <div className="premium-table-container" style={{ marginBottom: '1.5rem' }}>
                      <table className="premium-table">
                        <thead>
                          <tr>
                            <th style={{ width: '25%' }}>변경 항목</th>
                            <th style={{ width: '35%', color: 'var(--danger)' }}>기존 원장 데이터</th>
                            <th style={{ width: '40%', color: 'var(--success)' }}>결재 상신 데이터</th>
                          </tr>
                        </thead>
                        <tbody>
                          {changes.map((ch, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 700 }}>{ch.name}</td>
                              <td className="diff-highlight-del" style={{ textDecoration: 'line-through' }}>{ch.oldVal}</td>
                              <td className="diff-highlight-add" style={{ fontWeight: 600 }}>{ch.newVal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 전체 JSON 구조 Diff 미리보기 */}
                  <div className="diff-viewer">
                    <div className="diff-grid">
                      <div className="diff-column">
                        <div className="diff-header" style={{ background: 'rgba(220, 38, 38, 0.05)', color: 'var(--danger)' }}>
                          🔴 실시간 배포 원본 (Active Schema)
                        </div>
                        <div className="diff-body">
                          {JSON.stringify(
                            {
                              departmentName: currentData?.departmentName,
                              introSummary: currentData?.introSummary,
                              contact: currentData?.contact,
                              historyCount: currentData?.history?.length || 0,
                              orgCount: currentData?.organization?.length || 0,
                              dutiesCount: currentData?.duties?.length || 0
                            }, 
                            null, 
                            2
                          )}
                        </div>
                      </div>

                      <div className="diff-column">
                        <div className="diff-header" style={{ background: 'rgba(5, 150, 105, 0.05)', color: 'var(--success)' }}>
                          🟢 결재 상신본 (Pending Schema)
                        </div>
                        <div className="diff-body">
                          {JSON.stringify(
                            {
                              departmentName: (pendingData || draftData)?.departmentName,
                              introSummary: (pendingData || draftData)?.introSummary,
                              contact: (pendingData || draftData)?.contact,
                              historyCount: (pendingData || draftData)?.history?.length || 0,
                              orgCount: (pendingData || draftData)?.organization?.length || 0,
                              dutiesCount: (pendingData || draftData)?.duties?.length || 0
                            }, 
                            null, 
                            2
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. 결재 상호작용 */}
                {/* 검토자 결재 UI */}
                {currentRole === 'reviewer' && systemStatus === 'IN_REVIEW' && (
                  <div className="premium-card" style={{ padding: '1.5rem', background: 'var(--bg-tertiary)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>부서검토자 전용 의견 및 승인</h4>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">검토 의견서</label>
                      <input 
                        type="text" 
                        placeholder="검토 및 정합성 검증 확인 의견을 작성하세요..."
                        className="form-input"
                        value={reviewerOpinion}
                        onChange={(e) => setReviewerOpinion(e.target.value)}
                      />
                    </div>
                    <div className="btn-group">
                      <button className="btn btn-danger" onClick={handleReviewReject}>
                        <XCircle size={16} /> 반려
                      </button>
                      <button className="btn btn-success" onClick={handleReviewApprove}>
                        <CheckCircle size={16} /> 검토 승인 (승인자 전달)
                      </button>
                    </div>
                  </div>
                )}

                {/* 승인자 결재 UI */}
                {currentRole === 'approver' && systemStatus === 'APPROVED' && (
                  <div className="premium-card" style={{ padding: '1.5rem', background: 'var(--bg-tertiary)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>기관승인자 최종 의사결정</h4>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label className="form-label">승인 지시 코멘트</label>
                      <input 
                        type="text" 
                        placeholder="공개 공시 최종 지시사항을 작성하세요..."
                        className="form-input"
                        value={approverOpinion}
                        onChange={(e) => setApproverOpinion(e.target.value)}
                      />
                    </div>
                    <div className="btn-group">
                      <button className="btn btn-danger" onClick={handlePublishReject}>
                        <XCircle size={16} /> 결재 반려
                      </button>
                      <button className="btn btn-success" onClick={handlePublishApprove}>
                        <CheckCircle size={16} /> 최종 배포 및 공시 승인
                      </button>
                    </div>
                  </div>
                )}

                {/* 기안자 혹은 다른 역할일 시 표시 */}
                {((currentRole === 'editor' && systemStatus !== 'PUBLISHED') || 
                  (currentRole === 'reviewer' && systemStatus === 'APPROVED') ||
                  (currentRole === 'approver' && systemStatus === 'IN_REVIEW')) && (
                  <div style={{ background: 'rgba(217, 119, 6, 0.05)', border: '1px solid rgba(217, 119, 6, 0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--warning)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <HelpCircle size={18} />
                    <span>현재 사용자의 로그인 역할(<strong>{currentRole}</strong>)과 결재 진행 단계가 일치하지 않아 의사결정을 보류하고 있습니다. 왼쪽 사이드바에서 SSO 역할을 변경해 시뮬레이션을 진행해 보세요.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* [메뉴: 감사 로그 & 롤백실] */}
        {activeMenu === 'logs' && (
          <div className="premium-card" style={{ padding: '2rem' }}>
            <div className="admin-panel-header">
              <h3 className="admin-panel-title">기록 보존 및 시스템 감사 로그</h3>
              <span className="badge badge-danger">법적 보존 대상</span>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                「공공기록물 관리에 관한 법률」 및 공공기관 공시 규칙에 따라 원장 데이터의 생성, 수정, 검토, 반려, 배포 승인 등 전 과정에 대한 감사 추적 기능입니다. 각 배포 시점에는 스냅샷 데이터가 자동 아카이빙되며 1클릭 복구(롤백)를 지원합니다.
              </p>

              <div className="premium-table-container">
                <table className="premium-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>작업 시각</th>
                      <th style={{ width: '20%' }}>작업 주체 (ID)</th>
                      <th style={{ width: '15%' }}>유형</th>
                      <th style={{ width: '30%' }}>변경 내역 / 의견</th>
                      <th style={{ width: '15%' }}>작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs?.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {new Date(log.time).toLocaleDateString()} {new Date(log.time).toLocaleTimeString()}
                        </td>
                        <td style={{ fontWeight: 600 }}>{log.actor}</td>
                        <td>
                          <span className={`badge ${
                            log.type === 'PUBLISH' ? 'badge-success' : 
                            log.type === 'ROLLBACK' ? 'badge-primary' : 
                            log.type === 'REVIEW_REJECT' || log.type === 'PUBLISH_REJECT' ? 'badge-danger' : 'badge-warning'
                          }`}>
                            {log.type}
                          </span>
                        </td>
                        <td>
                          <strong>{log.reason}</strong>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{log.details}</p>
                        </td>
                        <td>
                          {log.snapshot ? (
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                              onClick={() => handleRollback(log)}
                            >
                              <RotateCcw size={12} /> 롤백
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>스냅샷 없음</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
