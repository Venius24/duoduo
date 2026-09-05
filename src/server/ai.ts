export async function aiExplain(context: {
  prompt?: string
  answer?: string
  userAnswer?: string
  explainFallback?: string
}): Promise<{ text: string; source: 'ai' | 'local' }> {
  const key = process.env.OPENAI_API_KEY
  const base = process.env.AI_BASE_URL || 'https://api.openai.com/v1'
  const model = process.env.AI_MODEL || 'gpt-4o-mini'

  const fallback =
    context.explainFallback ||
    (context.answer ? `Правильный ответ: ${context.answer}. Сравни со своим вариантом и запомни разницу.` : 'Попробуй ещё раз — ты почти у цели!')

  if (!key) return { text: fallback, source: 'local' }

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 15000)
    const res = await fetch(`${base}/chat/completions`, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model,
        max_tokens: 160,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content:
              'Ты дружелюбный преподаватель английского и китайского для русскоязычных учеников. Объясняй ошибку коротко (2-3 предложения), по-русски, без markdown.'
          },
          {
            role: 'user',
            content: `Задание: ${context.prompt || '(аудио/повторение)'}\nВерный ответ: ${context.answer}\nОтвет ученика: ${context.userAnswer}\nОбъясни, в чём ошибка.`
          }
        ]
      })
    })
    clearTimeout(timer)
    if (!res.ok) return { text: fallback, source: 'local' }
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    const text = data.choices?.[0]?.message?.content?.trim()
    return text ? { text, source: 'ai' } : { text: fallback, source: 'local' }
  } catch {
    return { text: fallback, source: 'local' }
  }
}
