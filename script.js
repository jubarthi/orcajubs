/* script.js */

document.addEventListener('DOMContentLoaded', function() {
    // Objeto global para armazenar os dados do formulário
    const formData = {};
  
    // Carregar a lista de vendedores do arquivo dados/vendedores.html
    fetch('dados/vendedores.html')
      .then(response => response.text())
      .then(data => {
        const select = document.getElementById('vendedorSelect');
        select.innerHTML = data;
      })
      .catch(err => {
        console.error('Erro ao carregar vendedores:', err);
      });
  
    // Carregar as descrições dos planos dos arquivos na pasta planos/
    const planos = ['gestao_criativa', 'gestao_trafego', 'gestao_completa', 'gestao_personalizada'];
    planos.forEach(plano => {
      fetch(`planos/${plano}.html`)
        .then(response => response.text())
        .then(data => {
          document.getElementById(`desc_${plano}`).innerHTML = data;
        })
        .catch(err => {
          console.error(`Erro ao carregar o plano ${plano}:`, err);
        });
    });
  
    // Definir a data padrão (hoje) e validade padrão
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('dataOrcamento').value = hoje;
    document.getElementById('validadeOrcamento').value = config.validadePadrao;
  
    // Função para navegação entre seções
    function showStep(current, next) {
      document.getElementById(current).style.display = 'none';
      document.getElementById(next).style.display = 'block';
    }
  
    // Passo 1: Seleção do Vendedor
    document.getElementById('btnStep1').addEventListener('click', function() {
      const vendedor = document.getElementById('vendedorSelect').value;
      if (!vendedor) {
        alert('Por favor, selecione um vendedor.');
        return;
      }
      formData.vendedor = vendedor;
      localStorage.setItem('formData', JSON.stringify(formData));
      showStep('step1', 'step2');
    });
  
    // Passo 2: Dados do Cliente
    document.getElementById('btnStep2').addEventListener('click', function() {
      const clienteNome = document.getElementById('clienteNome').value;
      const endereco = document.getElementById('endereco').value;
      const estado = document.getElementById('estado').value;
      const cidade = document.getElementById('cidade').value;
      const especialidade = document.getElementById('especialidade').value;
      const dataOrcamento = document.getElementById('dataOrcamento').value;
      const validadeOrcamento = document.getElementById('validadeOrcamento').value;
  
      if (!clienteNome || !endereco || !estado || !cidade || !especialidade) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      Object.assign(formData, { clienteNome, endereco, estado, cidade, especialidade, dataOrcamento, validadeOrcamento });
      localStorage.setItem('formData', JSON.stringify(formData));
      showStep('step2', 'step3');
    });
  
    // Limitar a seleção de checkboxes a no máximo 2
    const checkboxes = document.querySelectorAll('.planoCheckbox');
    checkboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const selecionados = document.querySelectorAll('.planoCheckbox:checked');
        if (selecionados.length > 2) {
          this.checked = false;
          alert('Você pode selecionar no máximo 2 itens.');
        }
      });
    });
  
    // Passo 3: Seleção dos Planos
    document.getElementById('btnStep3').addEventListener('click', function() {
      const selecionados = [];
      checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
          selecionados.push(checkbox.value);
        }
      });
      if (selecionados.length === 0) {
        alert('Por favor, selecione pelo menos um plano.');
        return;
      }
      formData.planos = selecionados;
      localStorage.setItem('formData', JSON.stringify(formData));
      showStep('step3', 'step4');
    });
  
    // Passo 4: Detalhes do Contrato
    document.getElementById('btnStep4').addEventListener('click', function() {
      const duracaoContrato = document.getElementById('duracaoContrato').value;
      const postsSemana = document.getElementById('postsSemana').value;
      const postsEstaticos = document.getElementById('postsEstaticos').value;
      const videosPocket = document.getElementById('videosPocket').value;
      const valorContrato = document.getElementById('valorContrato').value;
      const valorDesconto = document.getElementById('valorDesconto').value;
  
      if (!duracaoContrato || !postsSemana || !postsEstaticos || !videosPocket || !valorContrato || !valorDesconto) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      Object.assign(formData, { duracaoContrato, postsSemana, postsEstaticos, videosPocket, valorContrato, valorDesconto });
      localStorage.setItem('formData', JSON.stringify(formData));
      generatePreview();
      showStep('step4', 'step5');
    });
  
    // Função para gerar a pré-visualização do orçamento
    function generatePreview() {
      const preview = document.getElementById('previewOrcamento');
      preview.innerHTML = `
        <h2>Orçamento</h2>
        <p><strong>Vendedor:</strong> ${formData.vendedor}</p>
        <p><strong>Cliente:</strong> ${formData.clienteNome}</p>
        <p><strong>Endereço:</strong> ${formData.endereco}, ${formData.cidade} - ${formData.estado}</p>
        <p><strong>Especialidade:</strong> ${formData.especialidade}</p>
        <p><strong>Data do Orçamento:</strong> ${formData.dataOrcamento}</p>
        <p><strong>Validade:</strong> ${formData.validadeOrcamento}</p>
        <hr>
        <h3>Planos Selecionados:</h3>
        <ul>
          ${formData.planos.map(plano => `<li>${plano.replace('_', ' ')}</li>`).join('')}
        </ul>
        <hr>
        <p><strong>Duração do Contrato:</strong> ${formData.duracaoContrato}</p>
        <p><strong>Posts por Semana:</strong> ${formData.postsSemana}</p>
        <p><strong>Posts Estáticos por Semana:</strong> ${formData.postsEstaticos}</p>
        <p><strong>Vídeos Pocket por Semana:</strong> ${formData.videosPocket}</p>
        <p><strong>Valor do Contrato:</strong> R$ ${formData.valorContrato}</p>
        <p style="background: yellow; font-weight: bold;"><strong>Valor com Desconto:</strong> R$ ${formData.valorDesconto}</p>
      `;
    }
  
    // Geração do PDF com jsPDF
    document.getElementById('btnFinalizar').addEventListener('click', function() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      let y = 10;
      doc.setFontSize(config.pdfTitleFontSize);
      doc.text("Orçamento", 10, y);
      y += 10;
  
      doc.setFontSize(config.pdfTextFontSize);
      doc.text(`Vendedor: ${formData.vendedor}`, 10, y);
      y += 7;
      doc.text(`Cliente: ${formData.clienteNome}`, 10, y);
      y += 7;
      doc.text(`Endereço: ${formData.endereco}, ${formData.cidade} - ${formData.estado}`, 10, y);
      y += 7;
      doc.text(`Especialidade: ${formData.especialidade}`, 10, y);
      y += 7;
      doc.text(`Data do Orçamento: ${formData.dataOrcamento}`, 10, y);
      y += 7;
      doc.text(`Validade: ${formData.validadeOrcamento}`, 10, y);
      y += 10;
  
      doc.setFontSize(config.pdfSubtitleFontSize);
      doc.text("Planos Selecionados:", 10, y);
      y += 10;
      doc.setFontSize(config.pdfTextFontSize);
      formData.planos.forEach(plano => {
        doc.text(`- ${plano.replace('_', ' ')}`, 10, y);
        y += 7;
      });
      y += 5;
  
      doc.setFontSize(config.pdfSubtitleFontSize);
      doc.text("Detalhes do Contrato:", 10, y);
      y += 10;
      doc.setFontSize(config.pdfTextFontSize);
      doc.text(`Duração do Contrato: ${formData.duracaoContrato}`, 10, y);
      y += 7;
      doc.text(`Posts por Semana: ${formData.postsSemana}`, 10, y);
      y += 7;
      doc.text(`Posts Estáticos por Semana: ${formData.postsEstaticos}`, 10, y);
      y += 7;
      doc.text(`Vídeos Pocket por Semana: ${formData.videosPocket}`, 10, y);
      y += 7;
      doc.text(`Valor do Contrato: R$ ${formData.valorContrato}`, 10, y);
      y += 7;
  
      // Destaque para o valor com desconto
      doc.setFontSize(config.pdfValueFontSize);
      doc.setTextColor(255, 0, 0);
      doc.text(`Valor com Desconto: R$ ${formData.valorDesconto}`, 10, y);
      doc.setTextColor(0, 0, 0);
  
      // Se houver logo, você pode adicioná-la aqui (exemplo comentado):
      // doc.addImage('logo.png', 'PNG', 150, 10, 40, 20);
  
      doc.save('orcamento.pdf');
    });
  });
  