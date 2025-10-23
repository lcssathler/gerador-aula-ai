import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import multer from "multer";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

const upload = multer({ storage: multer.memoryStorage() });

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  console.log("Token recebido:", token);
  if (!token) {
    return res.status(401).json({ erro: 'Token de autenticação ausente' });
  }

  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ erro: 'Usuário não autenticado' });
  }

  req.user = user;
  console.log("Usuário autenticado:", user.email);
  console.log("UID do usuário:", user.uid); 
  next();
};

const requiredEnvVars = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GEMINI_API_KEY",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Erro: ${envVar} não definida no arquivo .env`);
    process.exit(1);
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

function sanitizeFileName(name) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "_")
    .replace(/_+/g, "_");
}

app.post("/api/gerar-plano", authenticate,  async (req, res) => {
  try {
    const { tema, serie, disciplina, duracao, nivel_dificuldade, contexto } =
      req.body;

    if (!tema || !serie || !disciplina || !duracao || !nivel_dificuldade) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    const prompt = `
Gere um plano de aula estruturado em JSON (retorne apenas o objeto JSON, sem marcações como \`\`\`json):
{
  "introducao": "texto lúdico de introdução",
  "objetivo_bncc": "objetivo da BNCC",
  "passo_a_passo": {
    "passo1": "descrição do primeiro passo",
    "passo2": "descrição do segundo passo",
    "passo3": "descrição do terceiro passo",
    ...
  },
  "rubrica": {
    "criterio1": "descrição do critério 1",
    "criterio2": "descrição do critério 2",
    ...
  }
}
Baseado nos dados:
- Tema: ${tema}
- Série: ${serie}
- Disciplina: ${disciplina}
- Duração: ${duracao} minutos
- Nível: ${nivel_dificuldade}
- Contexto: ${contexto || "não informado"}
Seguindo as instruções:
Introdução lúdica: Forma criativa e engajadora de apresentar o tema;
Objetivo de aprendizagem da BNCC: Alinhado à Base Nacional Comum Curricular;
Passo a passo da atividade: Roteiro detalhado para execução;
Rubrica de avaliação: Critérios para a professora avaliar o aprendizado;
O tamanho do plano deve ser adequado à duração informada e o nível de dificuldade.
A rigorosidade de verificação do JSON é essencial, e o critério de avaliação deve ser maior de acordo com o nível;
Consulte os materiais de apoio da BNCC para formular os objetivos de aprendizagem corretamente com base na série especificada.
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
    if (
      !plano.introducao ||
      !plano.objetivo_bncc ||
      !plano.passo_a_passo ||
      typeof plano.passo_a_passo !== "object" ||
      !plano.rubrica ||
      typeof plano.rubrica !== "object"
    ) {
      throw new Error("Estrutura do plano de aula retornada é inválida");
    }

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
        user_id: req.user.id,
      },
    ]);

    if (error) throw error;

    res.json({ sucesso: true, plano });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
});

app.post("/api/upload-pdf", authenticate, upload.single("pdf"), async (req, res) => {
  try {
    const { file } = req;
    const { tema } = req.body;

    if (!file) {
      return res.status(400).json({ erro: "Nenhum arquivo PDF enviado" });
    }

    const sanitizedTema = sanitizeFileName(tema);
    const fileName = `plano_${sanitizedTema}_${Date.now()}.pdf`;

    const { data, error } = await supabase.storage
      .from("planos_de_aula_pdf")
      .upload(fileName, file.buffer, {
        contentType: "application/pdf",
      });

    if (error) {
      console.error("Erro ao fazer upload no Supabase:", error);
      throw new Error(`Erro no upload: ${error.message}`);
    }

    const { data: publicData } = supabase.storage
      .from("planos_de_aula_pdf")
      .getPublicUrl(fileName);

    res.json({
      sucesso: true,
      message: "PDF salvo com sucesso no Supabase",
      publicUrl: publicData.publicUrl,
    });
  } catch (err) {
    console.error("Erro no endpoint /api/upload-pdf:", err);
    res.status(500).json({ erro: err.message || "Erro interno do servidor" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Servidor rodando em http://localhost:${PORT}`)
);
