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
바이럴 원고(맘카페·인스타·블로그)는 다루지 않습니다.

✅ 반드시 지킬 것
- 원고마다 문장 구조·어투·길이를 다르게 (다 비슷하면 어뷰징 의심)
- 진짜 방문 환자 말투로 (구어체, 줄임말 허용)
- 약간의 아쉬운 점 1~2개 포함 → 신뢰도 상승
- 병원 설정의 글자수 범위 반드시 준수
- 금지어 절대 사용 금지

❌ 절대 금지
- "강력 추천", "꼭 가보세요", "최고"
- 의료 효과 단정 표현 ("완벽하게 바뀌었어요", "100% 효과")
- 수치 과장 ("10년은 젊어보인다")
- 모든 항목 나열식 칭찬
- 같은 시작 문구 반복

출력: 반드시 순수 JSON 배열만. 코드블록(\`\`\`) 절대 사용 금지:
["리뷰 원고 1", "리뷰 원고 2", ...]`;

export interface Review {
  text: string;
}

export interface GenerateResult {
  ok: true;
  reviews: Review[];
  platform: Platform;
  hospital: string;
}

export interface GenerateError {
  ok: false;
  error: string;
}

export async function generateReviews(
  formData: FormData
): Promise<GenerateResult | GenerateError> {
  const platform = formData.get("platform") as Platform;
  const hospitalName = formData.get("hospital") as string;
  const emphasis = formData.get("emphasis") as string;
  const count = parseInt((formData.get("count") as string) ?? "5");
  const procedure = formData.get("procedure") as string | null;
  const notes = formData.get("notes") as string | null;

  if (!platform || !hospitalName) {
    return { ok: false, error: "플랫폼과 병원명을 선택해 주세요." };
  }

  const hospital = getHospital(hospitalName);
  const lengthGuide = hospital
    ? getLengthForPlatform(hospital, platform)
    : getDefaultLength(platform);

  const platformGuide =
    platform === "네이버플레이스"
      ? "키워드 자연스럽게 포함. 국내 검색 유입 최적화."
      : platform === "구글맵"
      ? "간결하고 직접적. 외국인·글로벌 유입 고려."
      : "이모지 1~2개 활용. 친근하고 짧은 톤.";

  let hospitalBlock = `병원명: ${hospitalName}`;
  if (hospital) {
    hospitalBlock = `병원명: ${hospital.name}
위치: ${hospital.location}
페르소나: ${hospital.persona}
선호 글자수: ${lengthGuide}
강조 키워드: ${hospital.keywords.join(", ")}
금지어: ${hospital.prohibited.join(", ")}
주력 시술: ${hospital.mainProcedures.join(", ")}${hospital.notes ? `\n특이사항: ${hospital.notes}` : ""}`;
  }

  const userPrompt = `다음 조건으로 O2O 리뷰 원고 ${count}개를 생성해 주세요.

플랫폼: ${platform}
플랫폼 특성: ${platformGuide}

${hospitalBlock}

강조포인트: ${emphasis || "전반적 만족"}${procedure ? `\n시술명: ${procedure}` : ""}${notes ? `\n추가 지시사항: ${notes}` : ""}

글자수 범위 ${lengthGuide} 엄수. JSON 배열로만 출력:`;

  try {
    const raw = await callOpenRouter(userPrompt, SYSTEM_PROMPT);

    let parsed: string[];
    try {
      parsed = JSON.parse(raw.trim());
    } catch {
      const match = raw.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("AI 응답을 파싱할 수 없습니다.");
      parsed = JSON.parse(match[0]);
    }

    if (!Array.isArray(parsed)) throw new Error("배열 형식이 아닙니다.");

    return {
      ok: true,
      reviews: parsed.map((text) => ({ text: String(text) })),
      platform,
      hospital: hospitalName,
    };
  } catch (e: unknown) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "AI 생성에 실패했습니다.",
    };
  }
}
