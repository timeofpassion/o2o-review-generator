const BASE_URL = "https://openrouter.ai/api/v1";

export async function callOpenRouter(
  prompt: string,
  systemPrompt: string
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL ?? "anthropic/claude-opus-4.7";

  if (!apiKey) throw new Error("OPENROUTER_API_KEY 환경변수가 설정되지 않았습니다.");

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://o2o-review.vercel.app",
      "X-Title": "O2O Review Generator",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      max_tokens: 4096,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenRouter 오류 (${res.status}): ${err}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}
