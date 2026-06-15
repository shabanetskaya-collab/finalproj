exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { apiKey, competitors, sources, brandContext } = JSON.parse(event.body);

  const prompt = `Ты — аналитик конкурентной разведки для медиа/инфобизнеса. Сгенерируй реалистичный еженедельный дайджест.

Конкуренты: ${competitors.join(', ')}
Источники: ${sources.join(', ')}
${brandContext ? 'Контекст бренда: ' + brandContext : ''}

Выдай ТОЛЬКО валидный JSON без markdown и backtick:
{
  "competitors": [
    {
      "name": "название",
      "activity_level": "высокая|средняя|низкая",
      "main_theme": "главная тема в 6-8 слов",
      "content_summary": "активность за неделю, 2-3 предложения",
      "top_move": "главный ход, 1 предложение",
      "ad_offer": "оффер или акция, или пустая строка",
      "risk_level": "высокий|средний|низкий"
    }
  ],
  "weekly_insights": [
    {
      "title": "заголовок инсайта",
      "description": "что это значит для нас, 2 предложения",
      "type": "opportunity|threat|trend"
    }
  ]
}`;

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + apiKey
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await resp.json();
    if (data.error) {
      return { statusCode: 400, body: JSON.stringify({ error: data.error.message }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ result: data.choices[0].message.content })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
