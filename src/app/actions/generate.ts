"use server";

import {
  getHospital,
  getLengthForPlatform,
  getDefaultLength,
  type Platform,
} from "@/lib/hospitals";
import { callOpenRouter } from "@/lib/openrouter";

const SYSTEM_PROMPT = `당신은 실제 병원을 방문한 환자처럼 리뷰를 작성하는 전문가입니다.

━━━ AI티 완전 제거 — 절대 금지 패턴 ━━━
이 패턴이 하나라도 등장하면 즉시 실패입니다:
× "전반적으로", "종합해보면", "만족스러운", "꼼꼼한 설명"으로 시작
× 첫째/둘째/③ 같은 나열식 구조
× 모든 항목(상담·시술·시설·가격)을 균형 있게 다 언급
× 완벽하게 정제된 문장 (실제 리뷰는 약간 어색하거나 생략이 있음)
× 모든 리뷰가 비슷한 길이
× 같은 단어로 시작하는 리뷰가 2개 이상
× ~했습니다 / ~드립니다 격식체 (구어체만)

━━━ 실제 플랫폼 리뷰 말투 학습 ━━━

[네이버플레이스 실제 스타일]
"원장님이 직접 봐주셔서 믿음이 갔어요. 다음에 또 올 것 같아요ㅎ"
"여기 진짜 괜찮은 것 같아요 상담이 꼼꼼해서 신뢰갔고 시술 후 경과도 마음에 들어요 근데 대기가 좀 있었어요"
"ㅋㅋ 친구 따라갔다가 저도 하게 됐는데 나쁘지 않네요"
"솔직히 반신반의하고 갔는데 생각보다 훨씬 좋았어요. 재방문 예약했습니다"
"피부 때문에 오래 고민했는데 여기서 제대로 잡은 것 같아요. 회복도 빠른 편이었고요"
"상담만 받고 가려했는데 그 자리에서 받았어요ㅎㅎ 결과는 지켜봐야겠지만 일단 만족"

[구글맵 실제 스타일]
"결과 자연스럽고 원장님도 친절해요"
"처음 방문인데 상담이 기대 이상이었어요. 부담 없이 얘기할 수 있었음"
"대기가 좀 있었지만 시술 결과는 만족스러워요. 재방문 의사 있음"
"친구 추천으로 왔는데 저도 만족해서 다른 친구한테 소개했어요"
"Good experience. Staff was attentive and the result looks natural."
"조금 비쌌지만 결과 보고 납득했어요"

[카카오맵 실제 스타일]
"원장님 친절✨ 결과 자연스러움"
"상담 꼼꼼👍 재방문 예정이에요"
"처음 갔는데 편하게 봐주셔서 좋았어요ㅎ"
"대기 좀 있었지만 그만한 것 같아요😊"
"ㄷㄷ 진짜 자연스럽게 됐음 만족"
"여기 생각보다 괜찮아요! 한번 가보세요"

━━━ 문장 길이 강제 다양화 ━━━
N개를 생성할 때 반드시 아래 비율로 배분:
- 1줄형 (30~90자): 핵심 한두 문장. 짧고 단호하게.
- 2줄형 (100~200자): 2가지 관점. 자연스러운 흐름.
- 3줄+형 (210~350자): 경험 서술형. 배경과 느낌 포함.
→ 3개 생성: 1줄 1개, 2줄 1개, 3줄+ 1개
→ 5개 생성: 1줄 2개, 2줄 2개, 3줄+ 1개
→ 10개 생성: 1줄 3개, 2줄 4개, 3줄+ 3개
모든 리뷰가 비슷한 길이로 나오면 즉시 실패.

━━━ 완전한 다양성 보장 ━━━
- 모든 리뷰의 첫 단어가 달라야 함 (필수)
- 어미 다양화: ~요, ~ㅎㅎ, ~임, ~함, ~인데, ~거든요, ~던데, ~었어요, ~더라고요
- 일부는 불완전하거나 생략된 문장으로 끝내도 됨
- 아쉬운 점 1개를 1~2개 리뷰에 자연스럽게 포함
- 이모지는 카카오맵에만, 네이버/구글은 이모지 최소화
- 각 리뷰는 완전히 다른 경험 서술 구조를 가져야 함

━━━ 출력 형식 ━━━
반드시 순수 JSON만. 코드블록(\`\`\`) 절대 금지:
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

const PERSONA_LABELS: Record<string, string> = {
  ageGroup:     "연령대",
  gender:       "성별",
  occupation:   "직업",
  visitCount:   "방문 횟수",
  visitTrigger: "방문 계기",
  companion:    "동행 여부",
  deliberation: "고민 기간",
};

function getLengthDistribution(count: number): string {
  const short  = Math.round(count * 0.3) || 1;
  const medium = Math.round(count * 0.4) || 1;
  const long   = Math.max(count - short - medium, 0);
  return `1줄형 ${short}개 / 2줄형 ${medium}개 / 3줄+형 ${long}개`;
}

export async function generateReviews(
  formData: FormData
): Promise<GenerateResult | GenerateError> {
  const platformsRaw = formData.get("platforms") as string;
  const platforms = platformsRaw.split(",").map(p => p.trim()).filter(Boolean) as Platform[];

  const hospitalName   = formData.get("hospital")  as string;
  const emphasis       = formData.get("emphasis")  as string;
  const count          = parseInt((formData.get("count") as string) ?? "5");
  const procedure      = formData.get("procedure") as string | null;
  const notes          = formData.get("notes")     as string | null;
  const feedbacksRaw   = formData.get("feedbacks") as string | null;
  const personaRaw     = formData.get("persona")   as string | null;

  if (!platforms.length) return { ok: false, error: "플랫폼을 하나 이상 선택해 주세요." };
  if (!hospitalName)     return { ok: false, error: "병원명을 선택해 주세요." };

  let feedbacks: StoredFeedback[] = [];
  try { feedbacks = JSON.parse(feedbacksRaw ?? "[]"); } catch { feedbacks = []; }

  let persona: Record<string, string[]> = {};
  try { persona = JSON.parse(personaRaw ?? "{}"); } catch { persona = {}; }

  const hospital = getHospital(hospitalName);

  const platformLines = platforms.map(p => {
    const len   = hospital ? getLengthForPlatform(hospital, p) : getDefaultLength(p);
    const guide = p === "네이버플레이스" ? "키워드 자연 포함, 국내 검색 최적화"
                : p === "구글맵"         ? "간결·직접적, 한국어+영어 혼용 가능"
                :                          "이모지 1~2개, 친근한 톤";
    return `  - ${p}: ${len} / ${guide}`;
  }).join("\n");

  let hospitalBlock = `병원명: ${hospitalName}`;
  if (hospital) {
    hospitalBlock = `병원명: ${hospital.name}
위치: ${hospital.location}
페르소나: ${hospital.persona}
강조 키워드: ${hospital.keywords.join(", ")}
금지어: ${hospital.prohibited.join(", ")}
주력 시술: ${hospital.mainProcedures.join(", ")}${hospital.notes ? `\n특이사항: ${hospital.notes}` : ""}`;
  }

  const personaEntries = Object.entries(persona).filter(([, v]) => v?.length > 0);
  const personaBlock = personaEntries.length > 0
    ? `\n[리뷰어 페르소나 — 복합적으로 반영, 말투·관심사·시각에 자연스럽게 녹여낼 것]\n${
        personaEntries.map(([k, v]) => `- ${PERSONA_LABELS[k] ?? k}: ${v.join(", ")}`).join("\n")
      }`
    : "";

  const feedbackBlock = feedbacks.length > 0
    ? `\n[이전 피드백 — 최우선 반영]\n${feedbacks.slice(-5).map(f => `- ${f.date}: ${f.text}`).join("\n")}`
    : "";

  const userPrompt = `다음 조건으로 각 플랫폼마다 O2O 리뷰 원고 ${count}개씩 생성.

${hospitalBlock}

플랫폼 및 글자수 기준:
${platformLines}

강조포인트: ${emphasis || "전반적 만족"}${procedure ? `\n시술명: ${procedure}` : ""}${notes ? `\n추가 지시: ${notes}` : ""}${personaBlock}${feedbackBlock}

[길이 분배 — 반드시 준수]
각 플랫폼당 ${count}개를 다음 비율로: ${getLengthDistribution(count)}

[검증 체크리스트 — 출력 전 확인]
□ 모든 리뷰의 첫 단어가 다른가?
□ 길이가 1줄/2줄/3줄+로 다양하게 섞였는가?
□ AI 냄새 나는 표현(전반적으로, 종합해보면)이 없는가?
□ 리뷰마다 완전히 다른 구조인가?

JSON으로만 출력:`;

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

    const results: PlatformReviews[] = platforms.map(p => ({
      platform: p,
      reviews: (parsed[p] ?? []).map(text => ({ text: String(text) })),
    }));

    return { ok: true, results, hospital: hospitalName };
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "AI 생성에 실패했습니다.",
    };
  }
}
