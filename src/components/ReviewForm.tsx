"use client";

import { useActionState, useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AccentButton } from "@/components/ui/AccentButton";
import { generateReviews, type PlatformReviews } from "@/app/actions/generate";
import { HOSPITALS, type Platform } from "@/lib/hospitals";

// ── 상수 ──────────────────────────────────────────────
const PLATFORMS: {
  id: Platform;
  label: string;
  short: string;
  active: string;
  inactive: string;
  dotBg: string;
}[] = [
  {
    id: "네이버플레이스",
    label: "네이버플레이스",
    short: "N",
    active: "border-[#03C75A] bg-[#dcfce7] text-[#03C75A]",
    inactive:
      "border-[var(--color-line)] bg-white/50 text-[var(--color-ink-soft)] hover:bg-white/80",
    dotBg: "bg-[#03C75A]",
  },
  {
    id: "구글맵",
    label: "구글맵",
    short: "G",
    active: "border-[#4285F4] bg-[#dbeafe] text-[#4285F4]",
    inactive:
      "border-[var(--color-line)] bg-white/50 text-[var(--color-ink-soft)] hover:bg-white/80",
    dotBg: "bg-[#4285F4]",
  },
  {
    id: "카카오맵",
    label: "카카오맵",
    short: "K",
    active: "border-[#FFCE00] bg-[#fef9c3] text-[#B8960C]",
    inactive:
      "border-[var(--color-line)] bg-white/50 text-[var(--color-ink-soft)] hover:bg-white/80",
    dotBg: "bg-[#FFCE00]",
  },
];

const EMPHASIS_OPTIONS = ["결과", "상담", "시설", "가성비", "회복", "접근성"];
const COUNT_OPTIONS = [3, 5, 10];
const FEEDBACK_KEY = "o2o_review_feedbacks";

// ── 피드백 스토리지 ──────────────────────────────────
interface StoredFeedback {
  date: string;
  hospital: string;
  platforms: string[];
  text: string;
}

function loadFeedbacks(): StoredFeedback[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FEEDBACK_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function appendFeedback(fb: StoredFeedback) {
  const list = loadFeedbacks();
  list.push(fb);
  localStorage.setItem(FEEDBACK_KEY, JSON.stringify(list.slice(-20)));
}

// ── 메인 컴포넌트 ─────────────────────────────────────
export function ReviewForm() {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
  const [emphasis, setEmphasis] = useState<string[]>([]);
  const [count, setCount] = useState(5);
  const [currentHospital, setCurrentHospital] = useState("");
  const [feedbacks, setFeedbacks] = useState<StoredFeedback[]>([]);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  useEffect(() => {
    setFeedbacks(loadFeedbacks());
  }, []);

  const [result, dispatch, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => generateReviews(formData),
    undefined
  );

  const togglePlatform = (p: Platform) =>
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  const toggleEmphasis = (e: string) =>
    setEmphasis((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );

  const handleFeedbackSave = () => {
    const text = feedbackText.trim();
    if (!text) return;
    const fb: StoredFeedback = {
      date: new Date().toLocaleDateString("ko-KR"),
      hospital: currentHospital,
      platforms: selectedPlatforms,
      text,
    };
    appendFeedback(fb);
    setFeedbacks(loadFeedbacks());
    setFeedbackText("");
    setFeedbackSaved(true);
    setTimeout(() => setFeedbackSaved(false), 2500);
  };

  const recentFeedbacks = feedbacks.slice(-5);
  const canGenerate = selectedPlatforms.length > 0 && currentHospital !== "";

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <img
            src="/logo_passion.png"
            alt="열정의시간"
            className="h-8 object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <div className="leading-tight">
            <div className="text-[var(--color-ink)] font-semibold">
              O2O 리뷰 원고 생성기
            </div>
            <div className="text-[var(--color-ink-soft)] text-xs">
              네이버플레이스 · 구글맵 · 카카오맵
            </div>
          </div>
        </div>
        <span className="text-[var(--color-ink-muted)] text-xs tracking-widest uppercase">
          열정의시간
        </span>
      </div>

      <GlassCard padding="lg">
        <form action={dispatch} className="flex flex-col gap-7">
          {/* Hidden fields */}
          <input
            type="hidden"
            name="platforms"
            value={selectedPlatforms.join(",")}
          />
          <input
            type="hidden"
            name="emphasis"
            value={emphasis.join(",")}
          />
          <input type="hidden" name="count" value={count} />
          <input
            type="hidden"
            name="feedbacks"
            value={JSON.stringify(recentFeedbacks)}
          />

          {/* Intro */}
          <div>
            <span className="text-[var(--color-accent)] text-xs font-medium tracking-widest uppercase">
              병원 전문 리뷰 원고
            </span>
            <h1 className="text-3xl font-semibold mt-1 text-[var(--color-ink)] leading-tight">
              어떤 리뷰 원고를
              <br />
              만들어 드릴까요? 📍
            </h1>
          </div>

          {/* Platform — 다중 선택 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[var(--color-ink-soft)] text-xs font-medium uppercase tracking-wider">
                플랫폼 선택 * (복수 가능)
              </span>
              {selectedPlatforms.length > 0 && (
                <span className="text-[var(--color-accent)] text-xs font-medium">
                  {selectedPlatforms.length}개 선택됨
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {PLATFORMS.map((p) => {
                const isActive = selectedPlatforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => togglePlatform(p.id)}
                    className={[
                      "relative flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition font-medium text-sm",
                      isActive ? p.active : p.inactive,
                    ].join(" ")}
                  >
                    {isActive && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-current opacity-80 flex items-center justify-center text-white text-[10px]">
                        ✓
                      </span>
                    )}
                    <span
                      className={[
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white",
                        p.dotBg,
                      ].join(" ")}
                    >
                      {p.short}
                    </span>
                    <span className="text-xs leading-tight text-center">
                      {p.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hospital */}
          <div className="flex flex-col gap-2">
            <span className="text-[var(--color-ink-soft)] text-xs font-medium uppercase tracking-wider">
              병원명 *
            </span>
            <select
              name="hospital"
              defaultValue=""
              onChange={(e) => setCurrentHospital(e.target.value)}
              className="w-full h-12 px-4 rounded-xl bg-white/70 border border-[var(--color-line)] text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)]/60 focus:ring-4 focus:ring-[var(--color-accent)]/15 cursor-pointer"
            >
              <option value="" disabled>
                병원을 선택하세요
              </option>
              {HOSPITALS.map((h) => (
                <option key={h.name} value={h.name}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Emphasis */}
          <div className="flex flex-col gap-2">
            <span className="text-[var(--color-ink-soft)] text-xs font-medium uppercase tracking-wider">
              강조포인트 (복수 선택)
            </span>
            <div className="flex flex-wrap gap-2">
              {EMPHASIS_OPTIONS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleEmphasis(e)}
                  className={[
                    "px-4 py-2 rounded-full text-sm font-medium border transition",
                    emphasis.includes(e)
                      ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                      : "bg-white/60 text-[var(--color-ink-soft)] border-[var(--color-line)] hover:border-[var(--color-accent)]/40",
                  ].join(" ")}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div className="flex flex-col gap-2">
            <span className="text-[var(--color-ink-soft)] text-xs font-medium uppercase tracking-wider">
              플랫폼당 생성 개수
            </span>
            <div className="flex gap-3">
              {COUNT_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCount(c)}
                  className={[
                    "flex-1 py-3 rounded-xl border text-sm font-medium transition",
                    count === c
                      ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
                      : "bg-white/50 text-[var(--color-ink-soft)] border-[var(--color-line)] hover:bg-white/80",
                  ].join(" ")}
                >
                  {c}개
                </button>
              ))}
            </div>
            {selectedPlatforms.length > 1 && (
              <p className="text-[var(--color-ink-muted)] text-xs">
                총 {count * selectedPlatforms.length}개 생성 ({selectedPlatforms.length}개 플랫폼 × {count}개)
              </p>
            )}
          </div>

          {/* Optional */}
          <div className="flex flex-col gap-3">
            <span className="text-[var(--color-ink-soft)] text-xs font-medium uppercase tracking-wider">
              선택사항
            </span>
            <input
              type="text"
              name="procedure"
              placeholder="시술명 (예: 써마지FLX, 보톡스)"
              className="w-full h-12 px-4 rounded-xl bg-white/70 border border-[var(--color-line)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] outline-none transition focus:border-[var(--color-accent)]/60 focus:ring-4 focus:ring-[var(--color-accent)]/15"
            />
            <textarea
              name="notes"
              placeholder="추가 지시사항"
              rows={2}
              className="w-full px-4 py-3 rounded-xl bg-white/70 border border-[var(--color-line)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] outline-none transition focus:border-[var(--color-accent)]/60 focus:ring-4 focus:ring-[var(--color-accent)]/15 resize-none"
            />
          </div>

          {/* 누적 피드백 미리보기 */}
          {recentFeedbacks.length > 0 && (
            <div className="rounded-2xl bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20 p-4 flex flex-col gap-2">
              <span className="text-[var(--color-accent)] text-xs font-semibold uppercase tracking-wider">
                반영 중인 피드백 {feedbacks.length}건
              </span>
              <ul className="flex flex-col gap-1">
                {recentFeedbacks.map((fb, i) => (
                  <li key={i} className="text-[var(--color-ink-soft)] text-xs flex gap-2">
                    <span className="text-[var(--color-ink-muted)] shrink-0">{fb.date}</span>
                    <span>{fb.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <AccentButton
            type="submit"
            disabled={isPending || !canGenerate}
            className="w-full"
          >
            {isPending
              ? "생성 중…"
              : `리뷰 원고 생성하기 →${selectedPlatforms.length > 1 ? ` (${selectedPlatforms.length}개 플랫폼)` : ""}`}
          </AccentButton>
        </form>
      </GlassCard>

      {/* Loading */}
      {isPending && <LoadingState platforms={selectedPlatforms} count={count} />}

      {/* Results */}
      {result && !isPending && (
        result.ok ? (
          <>
            <ReviewResults results={result.results} hospital={result.hospital} />

            {/* 게시 주의 */}
            <div className="px-4 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center">
              ⚠️ 하루 1~2개씩 날짜 분산 게시. 한꺼번에 올리면 어뷰징 감지 위험.
            </div>

            {/* 피드백 수집 */}
            <FeedbackCard
              hospital={result.hospital}
              platforms={result.results.map((r) => r.platform)}
              feedbackText={feedbackText}
              setFeedbackText={setFeedbackText}
              onSave={handleFeedbackSave}
              saved={feedbackSaved}
            />
          </>
        ) : (
          <ErrorCard message={result.error} />
        )
      )}
    </div>
  );
}

// ── 하위 컴포넌트 ─────────────────────────────────────

function LoadingState({ platforms, count }: { platforms: Platform[]; count: number }) {
  return (
    <GlassCard className="flex flex-col gap-5 animate-pulse">
      {platforms.map((p) => (
        <div key={p} className="flex flex-col gap-2">
          <div className="h-4 w-1/4 rounded-full bg-[var(--color-ink)]/10" />
          {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 w-full rounded-full bg-[var(--color-ink)]/6" />
              <div className="h-3 w-4/5 rounded-full bg-[var(--color-ink)]/5" />
            </div>
          ))}
        </div>
      ))}
      <p className="text-[var(--color-ink-muted)] text-xs">
        병원 설정 적용 중… 잠시 기다려 주세요.
      </p>
    </GlassCard>
  );
}

function ReviewResults({
  results,
  hospital,
}: {
  results: PlatformReviews[];
  hospital: string;
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="px-2 flex items-center justify-between">
        <span className="text-[var(--color-ink-soft)] text-xs font-medium uppercase tracking-wider">
          생성 완료 — {hospital}
        </span>
        <span className="text-[var(--color-ink-muted)] text-xs">
          총 {results.reduce((s, r) => s + r.reviews.length, 0)}개
        </span>
      </div>

      {results.map(({ platform, reviews }) => (
        <PlatformSection key={platform} platform={platform} reviews={reviews} />
      ))}
    </div>
  );
}

const PLATFORM_CHAR_RANGE: Record<Platform, [number, number]> = {
  네이버플레이스: [100, 400],
  구글맵: [80, 200],
  카카오맵: [50, 150],
};

const PLATFORM_LABEL_STYLE: Record<Platform, string> = {
  네이버플레이스: "bg-[#03C75A] text-white",
  구글맵: "bg-[#4285F4] text-white",
  카카오맵: "bg-[#FFCE00] text-[#5C4A00]",
};

function PlatformSection({
  platform,
  reviews,
}: {
  platform: Platform;
  reviews: { text: string }[];
}) {
  const charRange = PLATFORM_CHAR_RANGE[platform];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <span
          className={[
            "px-3 py-1 rounded-full text-xs font-semibold",
            PLATFORM_LABEL_STYLE[platform],
          ].join(" ")}
        >
          {platform}
        </span>
        <span className="text-[var(--color-ink-muted)] text-xs">
          {charRange[0]}~{charRange[1]}자 기준
        </span>
      </div>

      {reviews.map((r, i) => (
        <ReviewCard key={i} index={i + 1} text={r.text} charRange={charRange} />
      ))}
    </div>
  );
}

function ReviewCard({
  index,
  text,
  charRange,
}: {
  index: number;
  text: string;
  charRange: [number, number];
}) {
  const len = text.length;
  const [min, max] = charRange;
  const inRange = len >= min && len <= max;
  const tooShort = len < min;

  const charBadge = inRange
    ? "bg-emerald-100 text-emerald-700"
    : tooShort
    ? "bg-amber-100 text-amber-700"
    : "bg-red-100 text-red-700";

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <GlassCard padding="md" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] text-xs font-semibold flex items-center justify-center">
            {index}
          </span>
          <span
            className={[
              "px-2 py-0.5 rounded-full text-xs font-medium",
              charBadge,
            ].join(" ")}
          >
            {len}자 {inRange ? "✓" : tooShort ? "▼짧음" : "▲김"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={[
            "px-3 py-1.5 rounded-full text-xs font-medium border transition",
            copied
              ? "bg-[var(--color-accent)] text-white border-[var(--color-accent)]"
              : "bg-white/70 border-[var(--color-line)] text-[var(--color-ink-soft)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30",
          ].join(" ")}
        >
          {copied ? "복사됨 ✓" : "복사"}
        </button>
      </div>
      <p className="text-[var(--color-ink)] text-sm leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    </GlassCard>
  );
}

function FeedbackCard({
  hospital,
  platforms,
  feedbackText,
  setFeedbackText,
  onSave,
  saved,
}: {
  hospital: string;
  platforms: Platform[];
  feedbackText: string;
  setFeedbackText: (v: string) => void;
  onSave: () => void;
  saved: boolean;
}) {
  return (
    <GlassCard padding="md" className="flex flex-col gap-4 border-[var(--color-accent)]/20">
      <div className="flex flex-col gap-1">
        <span className="text-[var(--color-accent)] text-xs font-semibold uppercase tracking-wider">
          피드백 입력 필수
        </span>
        <p className="text-[var(--color-ink)] text-sm font-medium">
          이번 결과 개선사항이 있나요?
        </p>
        <p className="text-[var(--color-ink-soft)] text-xs">
          입력한 피드백은 다음 생성에 자동 반영됩니다. 없으면 <strong>없음</strong> 입력.
        </p>
      </div>

      <textarea
        value={feedbackText}
        onChange={(e) => setFeedbackText(e.target.value)}
        placeholder="예: 리뷰 문체가 너무 비슷함, 아쉬운 점이 너무 많이 포함됨, 없음"
        rows={3}
        className="w-full px-4 py-3 rounded-xl bg-white/70 border border-[var(--color-line)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] outline-none transition focus:border-[var(--color-accent)]/60 focus:ring-4 focus:ring-[var(--color-accent)]/15 resize-none text-sm"
      />

      <div className="flex items-center gap-3">
        <AccentButton
          type="button"
          onClick={onSave}
          disabled={!feedbackText.trim() || saved}
          className="flex-1 h-11 text-sm"
        >
          {saved ? "저장됨 ✓ 다음 생성에 반영" : "피드백 저장 → 다음 생성에 자동 반영"}
        </AccentButton>
      </div>

      <p className="text-[var(--color-ink-muted)] text-xs text-center">
        {hospital} · {platforms.join(", ")}
      </p>
    </GlassCard>
  );
}

function ErrorCard({ message }: { message: string }) {
  return (
    <GlassCard className="border-red-200 bg-red-50/50">
      <p className="text-red-600 font-medium text-sm">오류가 발생했습니다</p>
      <p className="text-red-500 text-sm mt-1">{message}</p>
    </GlassCard>
  );
}
