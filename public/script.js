const form = document.getElementById("form");
const resultado = document.getElementById("resultado");
const loading = document.getElementById("loading");
const error = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  resultado.style.display = "none";
  error.style.display = "none";
  loading.style.display = "block";

  const data = Object.fromEntries(new FormData(form));
  data.duracao = parseInt(data.duracao);

  try {
    const resp = await fetch("/api/gerar-plano", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await resp.json();
    if (!resp.ok || !json.sucesso || !json.plano) {
      throw new Error(json.erro || "Falha ao gerar o plano de aula");
    }

    document.getElementById("plano-tema").textContent = data.tema;
    document.getElementById("plano-serie").textContent = data.serie;
    document.getElementById("plano-disciplina").textContent = data.disciplina;
    document.getElementById("plano-duracao").textContent = data.duracao;
    document.getElementById("plano-nivel").textContent = data.nivel_dificuldade;
    document.getElementById("plano-introducao").textContent = json.plano.introducao;
    document.getElementById("plano-objetivo").textContent = json.plano.objetivo_bncc;

    const passoAPassoList = document.getElementById("plano-passo-a-passo");
    passoAPassoList.innerHTML = "";
    json.plano.passo_a_passo.forEach((passo) => {
      const li = document.createElement("li");
      li.textContent = passo;
      passoAPassoList.appendChild(li);
    });

    const rubricaTable = document.getElementById("plano-rubrica");
    rubricaTable.innerHTML = "";
    for (const [criterio, descricao] of Object.entries(json.plano.rubrica)) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${criterio}</td><td>${descricao}</td>`;
      rubricaTable.appendChild(tr);
    }

    resultado.style.display = "block";
  } catch (err) {
    error.textContent = `Erro: ${err.message}`;
    error.style.display = "block";
  } finally {
    loading.style.display = "none";
  }
});
