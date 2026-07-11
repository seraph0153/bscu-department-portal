export const initialDepartmentData = {
  departmentId: "sanhak-office",
  departmentName: "산학협력단",
  englishName: "Industry-Academic Cooperation Foundation",
  parentDepartment: "대학본부 > 산학협력단",
  urlSlug: "industry-cooperation",
  introSummary: "지역산업 연계 및 연구지원 총괄",
  managerTitle: "백석문화대학교 산학협력단 방문을 환영합니다",
  managerGreeting: "백석문화대학교 산학협력단은 대학의 풍부한 인적·물적 자원을 활용하여 지역 산업체와의 긴밀한 산학협력 체계를 구축하고 있습니다. 국가 및 지역 혁신을 위한 R&D 연구지원, 현장 맞춤형 취·창업 교육, 현장실습 강화 등을 통해 대학의 경쟁력을 높이고 지역 경제 발전에 기여할 수 있도록 끊임없이 노력하겠습니다. 여러분의 많은 관심과 참여를 부탁드립니다.",
  representativeImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
  contact: {
    phone: "041-550-0000",
    email: "sanhak@bscu.ac.kr",
    location: "본관 3층 산학협력단실"
  },
  history: [
    { id: "h1", year: "2025", date: "2025-03", title: "RISE 사업 선정", desc: "지역혁신중심 대학지원체계(RISE) 시범사업 수행기관 선정" },
    { id: "h2", year: "2024", date: "2024-05", title: "산학협력단 확대 개편", desc: "산학연구지원센터 및 취창업지원센터로 조직 고도화" },
    { id: "h3", year: "2023", date: "2023-09", title: "산학협력 최우수 대학 선정", desc: "지역 산업체 연계 취업률 부문 우수 기관 선정" }
  ],
  organization: [
    { id: "1", name: "단장", role: "산학협력단 총괄 및 대외 협력", parentId: null },
    { id: "2", name: "행정지원팀장", role: "실무 총괄 및 예결산 관리", parentId: "1" },
    { id: "3", name: "산학협력팀", role: "산학 공동연구 지원 및 연구비 중앙관리", parentId: "2" },
    { id: "4", name: "취창업지원팀", role: "학생 취·창업 지원 및 현장실습 운영", parentId: "2" }
  ],
  duties: [
    { id: "d1", category: "연구지원", task: "교내외 학술 연구비 신청 및 관리", manager: "산학협력팀 홍길동 (내선 101)" },
    { id: "d2", category: "정산/회계", task: "연구비 카드 발급 및 지출 정산", manager: "산학협력팀 김철수 (내선 102)" },
    { id: "d3", category: "취창업", task: "창업동아리 육성 및 보육센터 운영", manager: "취창업지원팀 이영희 (내선 201)" },
    { id: "d4", category: "현장실습", task: "대학생 현장실습(Co-op) 매칭 및 정산", manager: "취창업지원팀 박민수 (내선 202)" }
  ],
  regulations: [
    { id: "r1", name: "산학협력단 운영규정", code: "RULE-BSCU-101", date: "2024-01-01", url: "https://www.bscu.ac.kr/sanhak/5451/subview.do" },
    { id: "r2", name: "학술연구비 중앙관리규정", code: "RULE-BSCU-102", date: "2023-05-15", url: "https://law.go.kr/lsInfoP.do?lsiSeq=242019" },
    { id: "r3", name: "대학생 현장실습 운영규정", code: "RULE-BSCU-103", date: "2023-11-20", url: "https://www.schoolinfo.go.kr/download/enforcement_ordiance.pdf" }
  ],
  workflows: [
    {
      id: "wf1",
      name: "연구비 집행 및 정산 프로세스",
      ruleCode: "RULE-BSCU-102",
      steps: [
        { step: 1, name: "계획수립 및 청구", actor: "연구책임자", desc: "연구과제 수행계획에 따른 지출 청구서 작성" },
        { step: 2, name: "서류 검토", actor: "산학협력팀", desc: "연구비 중앙관리 규정 부합 여부 및 영수증 증빙 검토" },
        { step: 3, name: "승인 및 결재", actor: "산학협력단장", desc: "최종 결재권자의 연구비 집행 승인" },
        { step: 4, name: "집행 및 공개", actor: "산학협력팀", desc: "연구비 계좌 이체 완료 및 정산 결과 시스템 반영" }
      ]
    },
    {
      id: "wf2",
      name: "현장실습 매칭 및 지원 프로세스",
      ruleCode: "RULE-BSCU-103",
      steps: [
        { step: 1, name: "실습처 선발 및 매칭", actor: "취창업지원팀", desc: "산업체 수요 조사 및 대상 학생 매칭" },
        { step: 2, name: "사전 교육 및 서약", actor: "참여 학생", desc: "안전 교육 실시 및 현장실습 수행계획서 제출" },
        { step: 3, name: "현장 실습 수행", actor: "기업/학생", desc: "지정된 실습처에서 4주/8주간 실습 수행 및 주간 보고" },
        { step: 4, name: "평가 및 지원금 지급", actor: "취창업지원팀", desc: "기업 평가서 취합, 실습비 정산 및 지원금 지급" }
      ]
    }
  ],
  annualPlan: {
    year: "2027",
    target: "지역산업 협력 확대와 연구지원 고도화",
    reportUrl: "https://www.bscu.ac.kr/sites/web/files/rule/2024_bscu_self_report.pdf",
    projects: [
      "산학협력 선도 모델 고도화 및 신규 참여기업 유치",
      "연구비 집행 투명성 강화를 위한 중앙관리 자동화 시스템 구축",
      "지역혁신(RISE) 연계 산학 공동 기술개발 과제 확대"
    ],
    schedule: "1분기: 연간계획 수립 및 규정 개정 / 2분기: 과제 공모 및 기업 매칭 / 3분기: 중간점검 / 4분기: 최종 성과평가 및 연말 정산",
    kpi: "산학협력 가족회사 120개 이상 유치, 연구비 수주 총액 50억 원 달성, 학생 현장실습 이수율 85% 상회"
  },
  kpis: [
    { id: "k1", name: "참여기업 수", target: "120개", actual: "105개", date: "2026-06-30" },
    { id: "k2", name: "연구비 수주 총액", target: "50억", actual: "42억", date: "2026-06-30" },
    { id: "k3", name: "현장실습 이수율", target: "85%", actual: "88%", date: "2026-06-30" }
  ]
};

export const initialLogs = [
  { id: "log-1", time: "2026-07-11T10:00:00", actor: "부서편집자 (u10231)", type: "DRAFT", reason: "2027년도 연간계획 초안 작성", details: "연간계획 대상 및 KPI 신규 입력" },
  { id: "log-2", time: "2026-07-11T11:30:00", actor: "부서검토자 (u09420)", type: "REVIEW", reason: "연간계획 검토 완료", details: "규정 준수 여부 및 오탈자 확인 완료" },
  { id: "log-3", time: "2026-07-11T14:15:00", actor: "기관승인자 (u00011)", type: "PUBLISH", reason: "연간계획 최종 배포 승인", details: "배포 파이프라인 가동하여 메인 포털 동기화 완료" }
];
