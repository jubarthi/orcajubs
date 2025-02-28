/* script.js */

document.addEventListener('DOMContentLoaded', function() {
    // Objeto global para armazenar os dados do formulário
    const formData = {};
  
    // Objeto para armazenar a descrição (texto puro) de cada plano
    const planDescriptions = {};
  
    // Listagem dos planos para facilitar o carregamento
    const planos = ['gestao_criativa', 'gestao_trafego', 'gestao_completa', 'gestao_personalizada'];
  
    // 1. Carregar a lista de vendedores
    fetch('dados/vendedores.html')
      .then(response => response.text())
      .then(data => {
        const select = document.getElementById('vendedorSelect');
        select.innerHTML = data;
      })
      .catch(err => {
        console.error('Erro ao carregar vendedores:', err);
      });
  
    // 2. Carregar a descrição dos planos e armazenar em planDescriptions
    planos.forEach(plano => {
      fetch(`planos/${plano}.html`)
        .then(response => response.text())
        .then(htmlContent => {
          // Criamos um elemento temporário para "extrair" o texto puro
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlContent;
          // .textContent nos dá apenas o texto sem tags HTML
          const textOnly = tempDiv.textContent.trim();
          planDescriptions[plano] = textOnly;
          // Exibe no DOM
          document.getElementById(`desc_${plano}`).innerHTML = htmlContent;
        })
        .catch(err => {
          console.error(`Erro ao carregar o plano ${plano}:`, err);
        });
    });
  
    // 3. Definir data de hoje e validade padrão
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
      Object.assign(formData, { 
        clienteNome, 
        endereco, 
        estado, 
        cidade, 
        especialidade, 
        dataOrcamento, 
        validadeOrcamento 
      });
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
  
      if (
        !duracaoContrato || 
        !postsSemana || 
        !postsEstaticos || 
        !videosPocket || 
        !valorContrato || 
        !valorDesconto
      ) {
        alert('Por favor, preencha todos os campos.');
        return;
      }
      Object.assign(formData, { 
        duracaoContrato, 
        postsSemana, 
        postsEstaticos, 
        videosPocket, 
        valorContrato, 
        valorDesconto 
      });
      localStorage.setItem('formData', JSON.stringify(formData));
      generatePreview();
      showStep('step4', 'step5');
    });
  
    // Pré-visualização do Orçamento (na tela)
    function generatePreview() {
      const preview = document.getElementById('previewOrcamento');
      
      // Montar texto dos planos selecionados + descrição
      let planosHTML = '<ul>';
      formData.planos.forEach(pl => {
        // Nome do plano (ex: "gestao_criativa" -> "gestao criativa")
        const nomeFormatado = pl.replace('_', ' ');
        // Descrição pura (textContent) que armazenamos em planDescriptions
        const descricao = planDescriptions[pl];
        planosHTML += `
          <li>
            <strong>${nomeFormatado}:</strong> ${descricao}
          </li>
        `;
      });
      planosHTML += '</ul>';
  
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
        ${planosHTML}
        <hr>
        <p><strong>Duração do Contrato:</strong> ${formData.duracaoContrato}</p>
        <p><strong>Posts por Semana:</strong> ${formData.postsSemana}</p>
        <p><strong>Posts Estáticos por Semana:</strong> ${formData.postsEstaticos}</p>
        <p><strong>Vídeos Pocket por Semana:</strong> ${formData.videosPocket}</p>
        <p><strong>Valor do Contrato:</strong> R$ ${formData.valorContrato}</p>
        <p style="background: yellow; font-weight: bold;">
          <strong>Valor com Desconto:</strong> R$ ${formData.valorDesconto}
        </p>
      `;
    }
  
    // Geração do PDF com jsPDF
    document.getElementById('btnFinalizar').addEventListener('click', function() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF('p', 'mm', 'a4');
  
      // Carregar a imagem de cabeçalho e dimensioná-la para ocupar toda a largura da página, mantendo a proporção
      const img = new Image();
      img.onload = function() {
        const conversionFactor = 0.264583; // mm por pixel
        const naturalWidthMm = img.naturalWidth * conversionFactor;
        const naturalHeightMm = img.naturalHeight * conversionFactor;
        const pageWidth = 210; // largura da página A4 em mm (21cm)
        const scale = pageWidth / naturalWidthMm; // escalamos para preencher a largura
        const newWidth = pageWidth;
        const newHeight = naturalHeightMm * scale;
        
  
          // A imagem ocupará toda a largura; xPos = 0
          const xPos = 0;
          const yPos = 10; // margem superior
          
          // Adiciona a imagem sem distorção
          doc.addImage(img, 'PNG', xPos, yPos, newWidth, newHeight);
  
          // Definir o ponto de início do conteúdo abaixo da imagem (margem adicional de 10mm)
          let y = yPos + newHeight + 10;
  
          // Título
          doc.setFontSize(config.pdfTitleFontSize);
          doc.text("Orçamento", 10, y);
          y += 10;
  
          // Informações básicas
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
  
          // Planos Selecionados
          doc.setFontSize(config.pdfSubtitleFontSize);
          doc.text("Planos Selecionados:", 10, y);
          y += 10;
  
          doc.setFontSize(config.pdfTextFontSize);
          formData.planos.forEach(pl => {
              const nomePlano = pl.replace('_', ' ');
              doc.setFont(undefined, 'bold');
              doc.text(nomePlano, 10, y);
              y += 7;
              doc.setFont(undefined, 'normal');
  
              const descricaoPlano = planDescriptions[pl] || "";
              const splitted = doc.splitTextToSize(descricaoPlano, 180);
              splitted.forEach(line => {
                  doc.text(line, 10, y);
                  y += 7;
              });
              y += 5;
          });
  
          // Detalhes do Contrato
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
  
          // Salvar PDF
          doc.save('orcamento.pdf');
      };
      img.onerror = function() {
          console.error("Erro ao carregar a imagem de cabeçalho.");
          alert("Erro ao carregar a imagem de cabeçalho.");
      };
      img.src = 'images/cabelhado.png';
    });
});
