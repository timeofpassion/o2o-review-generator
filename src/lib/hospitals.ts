export type Platform = "네이버플레이스" | "구글맵" | "카카오맵";
export type Persona =
  | "전문적·신뢰감"
  | "따뜻·공감형"
  | "친근·캐주얼"
  | "감성적"
  | "정보전달형";

export interface Hospital {
  name: string;
  location: string;
  persona: Persona;
  naverLength?: string;
  googleLength?: string;
  kakaoLength?: string;
  keywords: string[];
  prohibited: string[];
  mainProcedures: string[];
  notes?: string;
  naverUrl?: string;
  kakaoUrl?: string;
  googleUrl?: string;
}

export const HOSPITALS: Hospital[] = [
  {
    name: "멜로우피부과 신사점",
    location: "서울 강남구 도산대로 138 12층",
    persona: "친근·캐주얼",
    naverLength: "중간 (150~250자)",
    kakaoLength: "짧음 (30~100자)",
    keywords: [
      "원장 직접 1:1 상담·시술",
      "프라이빗 개인룸",
      "자연스러운 결과",
      "원인 파악 후 맞춤 설명",
      "애프터케어",
    ],
    prohibited: ["저렴", "할인", "이벤트", "완벽", "100%"],
    mainProcedures: [
      "필러(광대·이마·입술)",
      "보톡스",
      "써마지",
      "울쎄라",
      "온다리프팅",
      "스킨부스터",
      "물광주사",
      "색소케어",
      "여드름·흉터",
      "모공",
    ],
    notes:
      "MZ 표현 허용(ㅋㅋ, ~임, ~함). '원장님 직접'·'프라이빗룸' 1회 자연스럽게. 결과는 '자연스럽다', '과하지 않다' 방향.",
    naverUrl: "https://naver.me/GOP9JXHA",
    kakaoUrl: "https://place.map.kakao.com/619108291",
  },
  {
    name: "멜로우피부과 공덕점",
    location: "서울 마포구 만리재로 24 2층",
    persona: "전문적·신뢰감",
    naverLength: "긴 원고 (250~400자)",
    keywords: [
      "전문의 1:1 맞춤 진료",
      "정가·정품·정량",
      "장기적 피부 안정성",
      "항노화·재생 철학",
      "프라이빗·럭셔리 인테리어",
    ],
    prohibited: ["저렴", "할인", "이벤트", "기적", "완벽", "극적 변화", "즉각 효과"],
    mainProcedures: [
      "울쎄라·써마지·티타늄·온다 리프팅",
      "리쥬란·쥬베룩·엑소좀·리투오",
      "색소·여드름·흉터·모공·탈모",
    ],
    notes:
      "신규 오픈 느낌 자연스럽게. 항노화·재생 철학 언급 가능. '피부과'→'피부관리/피부회복', '시술'→'관리/케어'.",
    naverUrl: "https://naver.me/GII1jtCu",
  },
  {
    name: "멜로우피부과 강북본점",
    location: "서울 도봉구 마들로13길 61 (지하 1층 480평 안티에이징센터)",
    persona: "따뜻·공감형",
    kakaoLength: "중간 (100~150자)",
    keywords: [
      "강남까지 갈 필요 없음",
      "강북 480평 안티에이징 전문센터",
      "전문의 직접 상담·시술",
      "합리적 가격",
    ],
    prohibited: ["기적", "완치", "극적 변화", "가격 단정"],
    mainProcedures: ["리프팅", "피부관리", "안티에이징"],
    notes:
      "'강남급 진료를 강북에서 합리적으로' 방향. '피부과'→'피부관리'. 과장·가격 정보 금지.",
    kakaoUrl: "https://place.map.kakao.com/2128289923",
  },
  {
    name: "멜로우피부과 천호점",
    location: "서울 강동구 천호대로 1024 4층",
    persona: "따뜻·공감형",
    naverLength: "중간 (150~250자)",
    keywords: [
      "자연스러운 변화",
      "과잉 권유 없음",
      "전문의 직접 상담",
      "차분하고 정돈된 분위기",
      "천호·성내동 접근성",
    ],
    prohibited: ["저렴", "기적", "완치", "극적 변화", "가격 단정"],
    mainProcedures: [
      "리프팅",
      "쥬베룩",
      "입술필러",
      "울쎄라",
      "써마지",
      "눈밑지방재배치",
    ],
    notes:
      "꼼꼼한 확인으로 신뢰감. 재방문 여운으로 마무리. '피부과'→'피부관리', '시술'→'관리·케어'.",
    naverUrl: "https://naver.me/GVE85kzi",
  },
  {
    name: "순수안피부과",
    location: "서울 서초구 사임당로 157 릿타워 4층",
    persona: "전문적·신뢰감",
    naverLength: "중간 (150~250자)",
    kakaoLength: "중간 (100~150자)",
    keywords: [
      "피부톤·탄력 기본부터",
      "색소+탄력 함께 상담",
      "리프팅 장비 풀라인업",
      "전문의 직접 조합 추천",
      "정직한 진료",
    ],
    prohibited: [
      "피부질환(아토피 등) 언급",
      "기적",
      "완치",
      "극적 변화",
      "가격 단정",
    ],
    mainProcedures: [
      "써마지FLX",
      "악센트프라임(튠페이스)",
      "브이로 어드밴스",
      "보톡스",
      "필러",
      "쥬베룩",
      "피코웨이",
      "순수안 물광주사",
    ],
    notes:
      "리프팅은 고객이 장비 고르는 구조 아님 → 전문의가 조합 추천. 써마지: 수면마취 없이 신경마취. 필러는 거의 볼필러 위주.",
    naverUrl: "https://naver.me/GDaHCwRC",
    kakaoUrl: "https://place.map.kakao.com/1842239601",
  },
  {
    name: "이현한방병원",
    location: "경북 구미시 산동읍 신당1로3길 3",
    persona: "친근·캐주얼",
    naverLength: "짧음 (50~150자)",
    kakaoLength: "짧음 (30~100자)",
    keywords: [
      "구미 산동 위치",
      "통증+피부 동시 관리",
      "점심시간 없는 진료",
      "한방병원 고급화",
      "원장 직접 상담",
    ],
    prohibited: ["기적", "완치"],
    mainProcedures: [
      "슈링크 유니버스",
      "피코토닝",
      "할리우드토닝",
      "아쿠아필",
      "라라필",
      "LDM재생",
      "제모",
      "문신제거",
      "한방치료·통증관리",
    ],
    notes:
      "한방병원 방문→피부도, 또는 피부 방문→한방도. '피부과' 단어 절대 금지. '피부관리·피부회복·밸런스케어'로 대체. 공휴일도 점심시간 없이 14:30까지 접수.",
    naverUrl: "https://naver.me/5HrMQWVL",
    kakaoUrl: "https://place.map.kakao.com/807586485",
  },
  {
    name: "올라라피부의원",
    location: "서울 강남구 논현로171길 11 3층 (압구정 4번출구)",
    persona: "따뜻·공감형",
    naverLength: "긴 원고 (250~400자)",
    kakaoLength: "중간 (100~150자)",
    keywords: [
      "40대 여성 원장 공감",
      "1:1 맞춤 리프팅 설계",
      "자연스러운 변화",
      "따뜻하고 편안한 공간",
      "애교필러·입술필러 성지",
    ],
    prohibited: ["강력추천", "저렴", "기적", "완치", "극적 변화"],
    mainProcedures: [
      "세르프",
      "올타이트",
      "슈링크",
      "보톡스",
      "필러",
      "힐로웨이브",
      "쥬베룩",
      "리쥬란",
      "스켈트라",
      "아쿠아필",
    ],
    notes:
      "'원장님도 40대 엄마라서 이해해주심' 자연스럽게. 티 나는 변화 지양. 피부진단기 촬영 후 상담 언급 가능.",
    naverUrl: "https://naver.me/FDGGQtaZ",
    kakaoUrl: "https://place.map.kakao.com/1125012391",
  },
];

export function getHospital(name: string): Hospital | undefined {
  return HOSPITALS.find((h) => h.name === name);
}

export function getLengthForPlatform(h: Hospital, platform: Platform): string {
  if (platform === "네이버플레이스") return h.naverLength ?? "100~300자";
  if (platform === "구글맵") return h.googleLength ?? "80~200자";
  return h.kakaoLength ?? "50~150자";
}

export function getDefaultLength(platform: Platform): string {
  if (platform === "네이버플레이스") return "100~300자";
  if (platform === "구글맵") return "80~200자";
  return "50~150자";
}
