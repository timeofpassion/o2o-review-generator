"use server";

import {
  getHospital,
  getLengthForPlatform,
  getDefaultLength,
  type Platform,
} from "@/lib/hospitals";
import { callOpenRouter } from "@/lib/openrouter";

const SYSTEM_PROMPT = `당신은 열정의시간의 병원 전문 O2O 리뷰 원고 작성 AI입니다.
네이버플레이스 / 구글맵 / 카카오맵에 게시하는 병원(성형외과·피부과·의원) O2O 리뷰 원고를 생성합니다.

✅ 반드시 지킬 것
- 원고마다 문장 구조·어투·길이를 다르게 (다 비슷하면 어뷰징 의심)
- 진짜 방문 환자 말투로 (구어체, 줄임말 허용)
- 약간의 아쉬운 점 1~2개 포함 → 신뢰도 상승
- 병원 설정의 글자수 범위 반드시 준수
- 금지어 절대 사용 금지
- [이전 피드백]이 있으면 해당 내용을 최우선으로 반영

❌ 절대 금지
- "강력 추천", "꼭 가보세요", "최고"
- 의료 효과 단정 표현 ("완벽하게 바뀌었어요", "100% 효과")
- 수치 과장 ("10년은 젊어보인다")
- 모든 항목 나열식 칭찬
- 같은 시작 문구 반복

출력: 반드시 아래 형식의 순수 JSON만. 코드블록(\`\`\`) 절대 금지:
{ "플랫폼명": ["리뷰1", "리뷰2", ...], ... }`;

export interface Review {
  text: string;
}

export interface PlatformReviews {
  platform: Platform;
  reviews: Review[];
}

export interface GenerateResult {
  ok: true;
  results: PlatformReviews[];
  hospital: string;
}

export interface GenerateError {
  ok: false;
  error: string;
}

interface StoredFeedback {
  date: string;
  text: string;
}

export async function generateReviews(
  formData: FormData
): Promise<GenerateResult | GenerateError> {
  const platformsRaw = formData.get("platforms") as string;
  const platforms = platformsRaw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean) as Platform[];

  const hospitalName = formData.get("hospital") as string;
  const emphasis = formData.get("emphasis") as string;
  const count = parseInt((formData.get("count") as string) ?? "5");
  const procedure = formData.get("procedure") as string | null;
  const notes = formData.get("notes") as string | null;
  const feedbacksRaw = formData.get("feedbacks") as string | null;
  const personaRaw   = formData.get("persona")   as string | null;

  if (!platforms.length) {
    return { ok: false, error: "플랫폼을 하나 이상 선택해 주세요." };
  }
  if (!hospitalName) {
    return { ok: false, error: "병원명을 선택해 주세요." };
  }

  let feedbacks: StoredFeedback[] = [];
  try { feedbacks = JSON.parse(feedbacksRaw ?? "[]"); } catch { feedbacks = []; }

  let persona: Record<string, string> = {};
  try { persona = JSON.parse(personaRaw ?? "{}"); } catch { persona = {}; }

  const PERSONA_LABELS: Record<string, string> = {
    ageGroup:     "연령대",
    gender:       "성별",
    occupation:   "직업",
    visitCount:   "방문 횟수",
    visitTrigger: "방문 계기",
    companion:    "동행 여부",
    deliberation: "고민 기간",
  };

  const personaBlock = Object.keys(persona).length > 0
    ? `\n[리뷰어 페르소나 — 이 특성의 실제 환자처럼 작성]\n${
        Object.entries(persona)
          .filter(([, v]) => v)
          .map(([k, v]) => `- ${PERSONA_LABELS[k] ?? k}: ${v}`)
          .join("\n")
      }`
    : "";

  const hospital = getHospital(hospitalName);

  const platformLines = platforms
    .map((p) => {
      const len = hospital ? getLengthForPlatform(hospital, p) : getDefaultLength(p);
      const guide =
        p === "네이버플레이스"
          ? "키워드 자연 포함, 국내 검색 최적화"
          : p === "구글맵"
          ? "간결·직접적, 외국인 고려"
          : "이모지 1~2개, 친근한 톤";
      return `  - ${p}: ${len} / ${guide}`;
    })
    .join("\n");

  let hospitalBlock = `병원명: ${hospitalName}`;
  if (hospital) {
    hospitalBlock = `병원명: ${hospital.name}
위치: ${hospital.location}
페르소나: ${hospital.persona}
강조 키워드: ${hospital.keywords.join(", ")}
금지어: ${hospital.prohibited.join(", ")}
주력 시술: ${hospital.mainProcedures.join(", ")}${hospital.notes ? `\n특이사항: ${hospital.notes}` : ""}`;
  }

  const feedbackBlock =
    feedbacks.length > 0
      ? `\n[이전 피드백 — 최우선 반영]\n${feedbacks
          .slice(-5)
          .map((f) => `- ${f.date}: ${f.text}`)
          .join("\n")}`
      : "";

  const userPrompt = `다음 조건으로 선택된 각 플랫폼마다 O2O 리뷰 원고 ${count}개씩 생성해 주세요.

${hospitalBlock}

선택 플랫폼 및 기준:
${platformLines}

강조포인트: ${emphasis || "전반적 만족"}${procedure ? `\n시술명: ${procedure}` : ""}${notes ? `\n추가 지시사항: ${notes}` : ""}${personaBlock}${feedbackBlock}

각 플랫폼당 ${count}개씩. JSON으로 출력:`;

  try {
    const raw = await callOpenRouter(userPrompt, SYSTEM_PROMPT);

    let parsed: Record<string, string[]>;
    try {
      parsed = JSON.parse(raw.trim());
    } catch {
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI 응답을 파싱할 수 없습니다.");
      parsed = JSON.parse(match[0]);
    }

    const results: PlatformReviews[] = platforms.map((p) => ({
      platform: p,
      reviews: (parsed[p] ?? []).map((text) => ({ text: String(text) })),
    }));

    return { ok: true, results, hospital: hospitalName };
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "AI 생성에 실패했습니다.",
    };
  }
}
