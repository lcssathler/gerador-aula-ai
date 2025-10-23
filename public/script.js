const form = document.getElementById("form");
const resultado = document.getElementById("resultado");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const exportPdfButton = document.getElementById("export-pdf");
const uploadStatus = document.getElementById("upload-status");

<<<<<<< HEAD
document.addEventListener("DOMContentLoaded", async () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");
  if (!isAuthenticated) {
    window.location.href = "/login.html";
  }
});

const supabaseUrl = "https://sxzzekfiggpmarmgckbo.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4enpla2ZpZ2dwbWFybWdja2JvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEwNDI2NzksImV4cCI6MjA3NjYxODY3OX0.AwCBFjW5_kixlIwFZvnb1np0ZFeoV7A5nEMkqVBHlns";
const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

document.getElementById("logout").addEventListener("click", async () => {
  await supabase.auth.signOut();
  localStorage.removeItem("isAuthenticated");
  window.location.href = "/login.html";
});

=======
>>>>>>> f66cc049157a6a3491eabe95b5822b93baf9838f
function checkAndAddPage(doc, y, margin = 10) {
  const pageHeight = doc.internal.pageSize.height;
  const maxY = pageHeight - margin;
  if (y > maxY) {
    doc.addPage();
    return margin;
  }
  return y;
}

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

    exportPdfButton.onclick = async () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      let y = 10;
      const margin = 10;
      const lineHeight = 7;

      doc.setFontSize(16);
      y = checkAndAddPage(doc, y, margin);
      doc.text("Plano de Aula", 10, y);
      y += 10;

      doc.setFontSize(12);
      y = checkAndAddPage(doc, y, margin);
      doc.text(`Tema: ${data.tema}`, 10, y);
      y += lineHeight;
      y = checkAndAddPage(doc, y, margin);
      doc.text(`Série: ${data.serie}`, 10, y);
      y += lineHeight;
      y = checkAndAddPage(doc, y, margin);
      doc.text(`Disciplina: ${data.disciplina}`, 10, y);
      y += lineHeight;
      y = checkAndAddPage(doc, y, margin);
      doc.text(`Duração: ${data.duracao} minutos`, 10, y);
      y += lineHeight;
      y = checkAndAddPage(doc, y, margin);
      doc.text(`Nível de Dificuldade: ${data.nivel_dificuldade}`, 10, y);
      y += 10;

      y = checkAndAddPage(doc, y, margin);
      doc.text("Introdução:", 10, y);
      y += lineHeight;
      const introducaoLines = doc.splitTextToSize(json.plano.introducao, 180);
      for (const line of introducaoLines) {
        y = checkAndAddPage(doc, y, margin);
        doc.text(line, 10, y);
        y += lineHeight;
      }
      y += 5;

      y = checkAndAddPage(doc, y, margin);
      doc.text("Objetivo BNCC:", 10, y);
      y += lineHeight;
      const objetivoLines = doc.splitTextToSize(json.plano.objetivo_bncc, 180);
      for (const line of objetivoLines) {
        y = checkAndAddPage(doc, y, margin);
        doc.text(line, 10, y);
        y += lineHeight;
      }
      y += 5;

      y = checkAndAddPage(doc, y, margin);
      doc.text("Passo a Passo:", 10, y);
      y += lineHeight;
      passosArray.forEach((passo, index) => {
        const passoLines = doc.splitTextToSize(`${index + 1}. ${passo}`, 180);
        for (const line of passoLines) {
          y = checkAndAddPage(doc, y, margin);
          doc.text(line, 10, y);
          y += lineHeight;
        }
      });
      y += 5;

      y = checkAndAddPage(doc, y, margin);
      doc.text("Rúbrica de Avaliação:", 10, y);
      y += lineHeight;
      for (const [criterio, descricao] of Object.entries(json.plano.rubrica)) {
        y = checkAndAddPage(doc, y, margin);
        const criterioLine = `Critério: ${criterio}`;
        doc.text(criterioLine, 10, y);
        y += lineHeight;
        const descricaoLines = doc.splitTextToSize(descricao, 180);
        for (const line of descricaoLines) {
          y = checkAndAddPage(doc, y, margin);
          doc.text(line, 10, y);
          y += lineHeight;
        }
        y += 3;
      }

      const pdfBlob = doc.output("blob");

      const formData = new FormData();
      formData.append(
        "pdf",
        pdfBlob,
        `plano_${data.tema.replace(/\s+/g, "_")}.pdf`
      );
      formData.append("tema", data.tema);

      try {
        uploadStatus.style.display = "block";
        uploadStatus.className = "loading";
        uploadStatus.textContent = "Enviando PDF para o Supabase...";

        const uploadResp = await fetch("/api/upload-pdf", {
          method: "POST",
          body: formData,
        });

        const uploadJson = await uploadResp.json();
        if (!uploadResp.ok || !uploadJson.sucesso) {
          throw new Error(uploadJson.erro || "Falha ao enviar o PDF");
        }

        uploadStatus.className = "success";
        uploadStatus.textContent = `PDF salvo com sucesso!`;
        doc.save("plano_de_aula.pdf");
      } catch (uploadErr) {
        uploadStatus.className = "error";
        uploadStatus.textContent = `Erro ao salvar PDF: ${uploadErr.message}`;
      }
    };

    resultado.style.display = "block";
  } catch (err) {
    error.textContent = `Erro: ${err.message}`;
    error.style.display = "block";
  } finally {
    loading.style.display = "none";
  }
});
