const form = document.getElementById("form");
const resultado = document.getElementById("resultado");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const exportPdfButton = document.getElementById("export-pdf");

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
    document.getElementById("plano-introducao").textContent =
      json.plano.introducao;
    document.getElementById("plano-objetivo").textContent =
      json.plano.objetivo_bncc;

    const passoAPassoList = document.getElementById("plano-passo-a-passo");
    passoAPassoList.innerHTML = "";
    const passosArray = Object.values(json.plano.passo_a_passo); 
    passosArray.forEach((passo) => {
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

    exportPdfButton.onclick = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      let y = 10;

      doc.setFontSize(16);
      doc.text("Plano de Aula", 10, y);
      y += 10;

      doc.setFontSize(12);
      doc.text(`Tema: ${data.tema}`, 10, y);
      y += 7;
      doc.text(`Série: ${data.serie}`, 10, y);
      y += 7;
      doc.text(`Disciplina: ${data.disciplina}`, 10, y);
      y += 7;
      doc.text(`Duração: ${data.duracao} minutos`, 10, y);
      y += 7;
      doc.text(`Nível de Dificuldade: ${data.nivel_dificuldade}`, 10, y);
      y += 10;

      doc.text("Introdução:", 10, y);
      y += 7;
      const introducaoLines = doc.splitTextToSize(json.plano.introducao, 180);
      doc.text(introducaoLines, 10, y);
      y += introducaoLines.length * 7 + 5;

      doc.text("Objetivo BNCC:", 10, y);
      y += 7;
      const objetivoLines = doc.splitTextToSize(json.plano.objetivo_bncc, 180);
      doc.text(objetivoLines, 10, y);
      y += objetivoLines.length * 7 + 5;

      doc.text("Passo a Passo:", 10, y);
      y += 7;
      passosArray.forEach((passo, index) => {
        const passoLines = doc.splitTextToSize(`${index + 1}. ${passo}`, 180);
        doc.text(passoLines, 10, y);
        y += passoLines.length * 7;
      });
      y += 5;

      doc.text("Rúbrica de Avaliação:", 10, y);
      y += 7;
      for (const [criterio, descricao] of Object.entries(json.plano.rubrica)) {
        const criterioLine = `Critério: ${criterio}`;
        doc.text(criterioLine, 10, y);
        y += 7;
        const descricaoLines = doc.splitTextToSize(descricao, 180);
        doc.text(descricaoLines, 10, y);
        y += descricaoLines.length * 7 + 3;
      }

      doc.save("plano_de_aula.pdf");
    };

    resultado.style.display = "block";
  } catch (err) {
    error.textContent = `Erro: ${err.message}`;
    error.style.display = "block";
  } finally {
    loading.style.display = "none";
  }
});
