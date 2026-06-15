exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  
  const { apiKey, prompt } = JSON.parse(event.body);
  
  try {
    const resp = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Bearer ' + apiKey 
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        tools: [{ type: 'web_search_preview' }],
        input: prompt
      })
    });
    
    const data = await resp.json();
    if (data.error) return { statusCode: 400, body: JSON.stringify({ error: data.error.message }) };
    
    // Extract text from output array
    const textBlock = (data.output || []).find(b => b.type === 'message');
    const text = textBlock?.content?.find(c => c.type === 'output_text')?.text || '';
    
    return { 
      statusCode: 200, 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ result: text }) 
    };
  } catch(e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
