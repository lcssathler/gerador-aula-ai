import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'


const SUPABASE_URL  = '{{SUPABASE_URL}}'  
const SUPABASE_KEY  = '{{SUPABASE_ANON_KEY}}'
const GEMINI_API_KEY = '{{GEMINI_API_KEY}}'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('lessonForm');
const resultEl = document.getElementById('result');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  resultEl.innerHTML = '<p>Gerando...</p>';
  const fd = new FormData(form);
  const data = Object.fromEntries(fd.entries());

 
  if (!data.tema || !data.serie || !data.disciplina || !data.duracao || !data.nivel_dificuldade) {
    resultEl.innerHTML = '<p style="color:red">Preencha todos os campos obrigatórios.</p>';
    return;
  }

  const prompt = `
Gere um plano de aula em JSON com os campos:
{
  "introducao": "texto curto, lúdico",
  "objetivo_bncc": "objetivo alinhado à BNCC (uma frase)",
  "passo_a_passo": ["passo 1", "passo 2", "..."],
  "rubrica": {"criterio1": "descrição", "criterio2": "descrição"}
}
Use o formato JSON estritamente. Dados da requisição:
Tema: ${data.tema}
Série: ${data.serie}
Disciplina: ${data.disciplina}
Duração: ${data.duracao} minutos
Nível: ${data.nivel_dificuldade}
Contexto: ${data.contexto || 'nenhum'}
  `;

  try {
    const geminiResp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        })
      }
    );

    if (!geminiResp.ok) {
      const txt = await geminiResp.text();
      throw new Error('Erro Gemini: ' + txt);
    }

    const geminiJson = await geminiResp.json();
    const candidate = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ?? JSON.stringify(geminiJson);
    let plan;
    try {
      plan = JSON.parse(candidate);
    } catch (err) {
      const m = candidate.match(/\{[\s\S]*\}/);
      if (m) plan = JSON.parse(m[0]);
      else throw new Error('Resposta do modelo não pôde ser convertida para JSON:\n' + candidate);
    }

    const row = {
      tema: data.tema,
      serie: data.serie,
      disciplina: data.disciplina,
      duracao: parseInt(data.duracao,10),
      nivel_dificuldade: data.nivel_dificuldade,
      introducao: plan.introducao || null,
      objetivo_bncc: plan.objetivo_bncc || null,
      passo_a_passo: JSON.stringify(plan.passo_a_passo || []),
      rubrica: JSON.stringify(plan.rubrica || {}),
    };

    const { error } = await supabase.from('lesson_plans').insert([row]);
    if (error) throw error;

    resultEl.innerHTML = `
      <h3>Plano de Aula Gerado</h3>
      <pre>${JSON.stringify(plan, null, 2)}</pre>
      <p style="color:green">Plano salvo no Supabase com sucesso.</p>
    `;
  } catch (err) {
    console.error(err);
    resultEl.innerHTML = '<pre style="color:red">' + (err.message || err) + '</pre>';
  }
});
