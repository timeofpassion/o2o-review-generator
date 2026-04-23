"use client";

import { useActionState, useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { AccentButton } from "@/components/ui/AccentButton";
import { generateReviews } from "@/app/actions/generate";
import { HOSPITALS, type Platform } from "@/lib/hospitals";

const PLATFORMS: {
  id: Platform;
  label: string;
  short: string;
  active: string;
  inactive: string;
  dot: string;
}[] = [
  {
    id: "네이버플레이스",
    label: "네이버플레이스",
    short: "N",
    active: "border-[#03C75A] bg-[#dcfce7] text-[#03C75A]",
    inactive: "border-[var(--color-line)] bg-white/50 text-[var(--color-ink-soft)] hover:bg-white/80",
    dot: "bg-[#03C75A]",
  },
  {
    id: "구글맵",
    label: "구글맵",
    short: "G",
    active: "border-[#4285F4] bg-[#dbeafe] text-[#4285F4]",
    inactive: "border-[var(--color-line)] bg-white/50 text-[var(--color-ink-soft)] hover:bg-white/80",
    dot: "bg-[#4285F4]",
  },
  {
    id: "카카오맵",
    label: "카카오맵",
    short: "K",
    active: "border-[#FFCE00] bg-[#fef9c3] text-[#B8960C]",
    inactive: "border-[var(--color-line)] bg-white/50 text-[var(--color-ink-soft)] hover:bg-white/80",
    dot: "bg-[#FFCE00]",
  },
];

const EMPHASIS_OPTIONS = ["결과", "상담", "시설", "가성비", "회복", "접근성"];
const COUNT_OPTIONS = [3, 5, 10];

export function ReviewForm() {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [emphasis, setEmphasis] = useState<string[]>([]);
  const [count, setCount] = useState(5);

  const [result, dispatch, isPending] = useActionState(
    async (_prev: unknown, formData: FormData) => generateReviews(formData),
    undefined
  );

  const toggleEmphasis = (e: string) =>
    setEmphasis((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <img src="/logo_passion.png" alt="열정의시간" className="h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
          <div className="leading-tight">
            <div className="text-[var(--color-ink)] font-semibold">O2O 리뷰 원고 생성기</div>
            <div className="text-[var(--color-ink-soft)] text-xs">네이버플레이스 · 구글맵 · 카카오맵</div>
          </div>
        </div>
        <span className="text-[var(--color-ink-muted)] text-xs tracking-widest uppercase">열정의시간</span>
      </div>

      <GlassCard padding="lg">
        <form action={dispatch} className="flex flex-col gap-7">
          {/* Hidden fields */}
          <input type="hidden" name="platform" value={platform ?? ""} />
          <input type="hidden" name="emphasis" value={emphasis.join(",")} />
          <input type="hidden" name="count" value={count} />

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

          {/* Platform */}
          <div className="flex flex-col gap-2">
            <span className="text-[var(--color-ink-soft)] text-xs font-medium uppercase tracking-wider">
              플랫폼 선택 *
            </span>
            <div className="grid grid-cols-3 gap-3">
              {PLATFORMS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPlatform(p.id)}
                  className={[
                    "flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition font-medium text-sm",
                    platform === p.id ? p.active : p.inactive,
                  ].join(" ")}
                >
                  <span
                    className={[
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                      platform === p.id ? p.dot + " text-white" : "bg-[var(--color-line)]",
                    ].join(" ")}
                  >
                    {p.short}
                  </span>
                  <span className="text-xs leading-tight text-center">{p.label}</span>
                </button>
              ))}
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
              생성 개수
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

          <AccentButton
            type="submit"
            disabled={isPending || !platform}
            className="w-full"
          >
            {isPending ? "생성 중…" : `리뷰 원고 ${count}개 생성하기 →`}
          </AccentButton>
        </form>
      </GlassCard>

      {/* Loading */}
      {isPending && <LoadingState count={count} />}

      {/* Results */}
      {result && !isPending && (
        result.ok ? (
          <ReviewResults
            reviews={result.reviews}
            platform={result.platform}
            hospital={result.hospital}
          />
        ) : (
          <ErrorCard message={result.error} />
        )
      )}

      {/* Posting notice */}
      {result?.ok && !isPending && (
        <div className="px-2 py-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm text-center">
          ⚠️ 하루 1~2개씩 날짜를 분산해서 게시하세요. 한꺼번에 올리면 어뷰징 감지될 수 있습니다.
        </div>
      )}
    </div>
  );
}

function LoadingState({ count }: { count: number }) {
  return (
    <GlassCard className="flex flex-col gap-4 animate-pulse">
      <div className="h-4 w-1/3 rounded-full bg-[var(--color-ink)]/8" />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="h-3 w-full rounded-full bg-[var(--color-ink)]/6" />
          <div className="h-3 w-4/5 rounded-full bg-[var(--color-ink)]/6" />
          <div className="h-3 w-3/5 rounded-full bg-[var(--color-ink)]/5" />
        </div>
      ))}
      <p className="text-[var(--color-ink-muted)] text-xs mt-1">
        AI가 병원 설정을 적용해 원고를 작성하는 중입니다…
      </p>
    </GlassCard>
  );
}

function ReviewResults({
  reviews,
  platform,
  hospital,
}: {
  reviews: { text: string }[];
  platform: Platform;
  hospital: string;
}) {
  const charRange =
    platform === "네이버플레이스"
      ? [100, 400]
      : platform === "구글맵"
      ? [80, 200]
      : [50, 150];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <span className="text-[var(--color-ink-soft)] text-xs font-medium uppercase tracking-wider">
          생성 완료 — {hospital} · {platform}
        </span>
        <span className="text-[var(--color-ink-muted)] text-xs">
          {reviews.length}개
        </span>
      </div>
      {reviews.map((r, i) => (
        <ReviewCard
          key={i}
          index={i + 1}
          text={r.text}
          charRange={charRange}
        />
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
  charRange: number[];
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

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <GlassCard padding="md" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] text-xs font-semibold flex items-center justify-center">
            {index}
          </span>
          <span className={["px-2 py-0.5 rounded-full text-xs font-medium", charBadge].join(" ")}>
            {len}자 {inRange ? "✓" : tooShort ? "▼짧음" : "▲김"}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/70 border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:text-[var(--color-accent)] hover:border-[var(--color-accent)]/30 transition"
        >
          복사
        </button>
      </div>
      <p className="text-[var(--color-ink)] text-sm leading-relaxed whitespace-pre-wrap">
        {text}
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
