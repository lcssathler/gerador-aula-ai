import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.post("/api/gerar-plano", async (req, res) => {
  try {
    const { tema, serie, disciplina, duracao, nivel_dificuldade, contexto } =
      req.body;

    if (!tema || !serie || !disciplina || !duracao || !nivel_dificuldade) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    const prompt = `
Gere um plano de aula estruturado em JSON com os seguintes campos:
{
  "introducao": "texto lúdico de introdução",
  "objetivo_bncc": "objetivo da BNCC",
  "passo_a_passo": ["passo 1", "passo 2", "..."],
  "rubrica": {"criterio1": "descrição", "criterio2": "descrição"}
}
Baseado nos dados:
Tema: ${tema}
Série: ${serie}
Disciplina: ${disciplina}
Duração: ${duracao} minutos
Nível: ${nivel_dificuldade}
Contexto: ${contexto || "não informado"}
`;
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY não definida no arquivo .env");
    }

    const geminiRes = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,

      { contents: [{ role: "user", parts: [{ text: prompt }] }] },
      { headers: { "Content-Type": "application/json" } }
    );

    const text =
      geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Resposta inválida da IA");
    console.log("Gemini response:", JSON.stringify(geminiRes.data, null, 2));
    const plano = JSON.parse(jsonMatch[0]);

    const { error } = await supabase.from("lesson_plans").insert([
      {
        tema,
        serie,
        disciplina,
        duracao,
        nivel_dificuldade,
        introducao: plano.introducao,
        objetivo_bncc: plano.objetivo_bncc,
        passo_a_passo: plano.passo_a_passo,
        rubrica: plano.rubrica,
      },
    ]);

    if (error) throw error;

    res.json({ sucesso: true, plano });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
