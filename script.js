/* =====================================================================
   CUCAS — CONTROLE DE PEDIDOS
   script.js

   Reproduz em JavaScript puro as regras de negócio da planilha original
   (ver DOCUMENTAÇÃO DA PLANILHA.txt):
     - VALOR é obtido por busca do produto (equivalente ao PROCV/VLOOKUP)
     - TAMANHO é identificado pelo nome do produto (350G/750G)
     - Prazo de pagamento de 7 dias conta a partir da DATA DE ENTREGA
     - PAGAMENTO nunca muda automaticamente para DEVENDO, apenas recebe
       um alerta visual (amarelo) quando ultrapassa o prazo
     - TOTAL A RECEBER = AGUARDANDO + DEVENDO / TOTAL JÁ PAGO = PAGO

   Dados persistidos em localStorage (chaves CUCAS_PRODUTOS / CUCAS_PEDIDOS).
   ===================================================================== */

(function () {
  "use strict";

  /* =====================================================================
     1. DADOS INICIAIS (SEED) — carregados de produtos.txt na primeira
        execução. Nunca sobrescrevem dados já existentes no localStorage.
     ===================================================================== */
  const SEED_PRODUTOS = [{"cod": "1", "produto": "Abacaxi 350G", "valor": 12.0}, {"cod": "2", "produto": "Amendoim 350G", "valor": 12.0}, {"cod": "3", "produto": "Amora 350G", "valor": 12.0}, {"cod": "4", "produto": "Banana 350G", "valor": 12.0}, {"cod": "5", "produto": "Bergamota 350G", "valor": 12.0}, {"cod": "6", "produto": "Coco 350G", "valor": 12.0}, {"cod": "7", "produto": "Doce de Leite 350G", "valor": 12.0}, {"cod": "8", "produto": "Goiabada 350G", "valor": 12.0}, {"cod": "9", "produto": "Laranja 350G", "valor": 12.0}, {"cod": "10", "produto": "Maça 350G", "valor": 12.0}, {"cod": "11", "produto": "Morango 350G", "valor": 12.0}, {"cod": "12", "produto": "Streusel 350G", "valor": 12.0}, {"cod": "13", "produto": "Uva 350G", "valor": 12.0}, {"cod": "14", "produto": "Abacaxi 750G", "valor": 18.0}, {"cod": "15", "produto": "Amendoim 750G", "valor": 18.0}, {"cod": "16", "produto": "Amora 750G", "valor": 18.0}, {"cod": "17", "produto": "Banana 750G", "valor": 18.0}, {"cod": "18", "produto": "Bergamota 750G", "valor": 18.0}, {"cod": "19", "produto": "Coco 750G", "valor": 18.0}, {"cod": "20", "produto": "Doce de Leite 750G", "valor": 18.0}, {"cod": "21", "produto": "Goiabada 750G", "valor": 18.0}, {"cod": "22", "produto": "Laranja 750G", "valor": 18.0}, {"cod": "23", "produto": "Maça 750G", "valor": 18.0}, {"cod": "24", "produto": "Morango 750G", "valor": 18.0}, {"cod": "25", "produto": "Streusel 750G", "valor": 18.0}, {"cod": "26", "produto": "Uva 750G", "valor": 18.0}, {"cod": "27", "produto": "Abacaxi c/ Coco 350G", "valor": 18.0}, {"cod": "28", "produto": "Abacaxi c/ Chocolate branco 350G", "valor": 18.0}, {"cod": "29", "produto": "Amendoim c/ Leite Condensado 350G", "valor": 18.0}, {"cod": "30", "produto": "Brigadeiro 350G", "valor": 18.0}, {"cod": "31", "produto": "Charge 350G", "valor": 18.0}, {"cod": "32", "produto": "Creme de Nozes 350G", "valor": 18.0}, {"cod": "33", "produto": "keschmier 350G", "valor": 18.0}, {"cod": "34", "produto": "Linguiça 350G", "valor": 18.0}, {"cod": "35", "produto": "Morango c/ Chocolate 350G", "valor": 18.0}, {"cod": "36", "produto": "Prestígio 350G", "valor": 18.0}, {"cod": "37", "produto": "Requeijão c/ Goiabada 350G", "valor": 18.0}, {"cod": "38", "produto": "Requeijão c/ Leite Condensado 350G", "valor": 18.0}, {"cod": "39", "produto": "Abacaxi c/ Coco 750G", "valor": 24.0}, {"cod": "40", "produto": "Abacaxi c/ Chocolate branco 750G", "valor": 24.0}, {"cod": "41", "produto": "Amendoim c/ Leite Condensado 750G", "valor": 24.0}, {"cod": "42", "produto": "Brigadeiro 750G", "valor": 24.0}, {"cod": "43", "produto": "Charge 750G", "valor": 24.0}, {"cod": "44", "produto": "Creme de Nozes 750G", "valor": 24.0}, {"cod": "45", "produto": "keschmier 750G", "valor": 24.0}, {"cod": "46", "produto": "Linguiça 750G", "valor": 24.0}, {"cod": "47", "produto": "Morango c/ Chocolate 750G", "valor": 24.0}, {"cod": "48", "produto": "Prestígio 750G", "valor": 24.0}, {"cod": "49", "produto": "Requeijão c/ Goiabada 750G", "valor": 24.0}, {"cod": "50", "produto": "Requeijão c/ Leite Condensado 750G", "valor": 24.0}, {"cod": "51", "produto": "Amora c/ Chocolate Branco 350G", "valor": 24.0}, {"cod": "52", "produto": "Bacon 350G", "valor": 24.0}, {"cod": "53", "produto": "Brigadeiro de Bacon 350G", "valor": 24.0}, {"cod": "54", "produto": "Damasco, Nozes e Gorgonzola 350G", "valor": 24.0}, {"cod": "55", "produto": "Doce de Leite c/ Gorgonzola 350G", "valor": 24.0}, {"cod": "56", "produto": "Figo c/ Gorgonzola 350G", "valor": 24.0}, {"cod": "57", "produto": "Floresta Negra 350G", "valor": 24.0}, {"cod": "58", "produto": "Geleia de Pimenta 350G", "valor": 24.0}, {"cod": "59", "produto": "Laranja c/ Chocolate 350G", "valor": 24.0}, {"cod": "60", "produto": "Linguiça c/ Cebola Caramelizada 350G", "valor": 24.0}, {"cod": "61", "produto": "Linguiça c/ Geleia de Abacaxi c/ Pimenta 350G", "valor": 24.0}, {"cod": "62", "produto": "Marta Rocha 350G", "valor": 24.0}, {"cod": "63", "produto": "Paçoca 350G", "valor": 24.0}, {"cod": "64", "produto": "Tomate Seco c/ Gorgonzola 350G", "valor": 24.0}, {"cod": "65", "produto": "Amora c/ Chocolate Branco 750G", "valor": 30.0}, {"cod": "66", "produto": "Bacon 750G", "valor": 30.0}, {"cod": "67", "produto": "Brigadeiro de Bacon 750G", "valor": 30.0}, {"cod": "68", "produto": "Damasco, Nozes e Gorgonzola 750G", "valor": 30.0}, {"cod": "69", "produto": "Doce de Leite c/ Gorgonzola 750G", "valor": 30.0}, {"cod": "70", "produto": "Figo c/ Gorgonzola 750G", "valor": 30.0}, {"cod": "71", "produto": "Floresta Negra 750G", "valor": 30.0}, {"cod": "72", "produto": "Geleia de Pimenta 750G", "valor": 30.0}, {"cod": "73", "produto": "Laranja c/ Chocolate 750G", "valor": 30.0}, {"cod": "74", "produto": "Linguiça c/ Cebola Caramelizada 750G", "valor": 30.0}, {"cod": "75", "produto": "Linguiça c/ Geleia de Abacaxi c/ Pimenta 750G", "valor": 30.0}, {"cod": "76", "produto": "Marta Rocha 750G", "valor": 30.0}, {"cod": "77", "produto": "Paçoca 750G", "valor": 30.0}, {"cod": "78", "produto": "Tomate Seco c/ Gorgonzola 750G", "valor": 30.0}];

  const STORAGE_KEYS = {
    produtos: "CUCAS_PRODUTOS",
    pedidos: "CUCAS_PEDIDOS",
    seeded: "CUCAS_SEEDED_V1"
  };

  const PRAZO_DIAS = 7; // prazo de pagamento a partir da data de entrega

  /* =====================================================================
     2. CAMADA DE ARMAZENAMENTO (localStorage)
     ===================================================================== */
  const Storage = {
    getProdutos() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.produtos);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error("Erro ao ler produtos do localStorage:", e);
        return [];
      }
    },
    saveProdutos(list) {
      localStorage.setItem(STORAGE_KEYS.produtos, JSON.stringify(list));
    },
    getPedidos() {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.pedidos);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        console.error("Erro ao ler pedidos do localStorage:", e);
        return [];
      }
    },
    savePedidos(list) {
      localStorage.setItem(STORAGE_KEYS.pedidos, JSON.stringify(list));
    },
    ensureSeed() {
      // Só semeia produtos uma única vez (primeira execução). Depois disso,
      // mesmo que o usuário apague todos os produtos, não voltamos a inserir
      // os dados iniciais — a lista pertence ao usuário a partir daí.
      const alreadySeeded = localStorage.getItem(STORAGE_KEYS.seeded);
      if (!alreadySeeded) {
        localStorage.setItem(STORAGE_KEYS.produtos, JSON.stringify(SEED_PRODUTOS));
        localStorage.setItem(STORAGE_KEYS.pedidos, JSON.stringify([]));
        localStorage.setItem(STORAGE_KEYS.seeded, "1");
      }
    }
  };

  /* =====================================================================
     3. UTILITÁRIOS DE FORMATO E DATA
     ===================================================================== */
  const Util = {
    // Converte texto digitado (ex.: "12,50" ou "12.5") em número.
    parseValorInput(str) {
      if (str === null || str === undefined) return NaN;
      const cleaned = String(str).trim().replace(/[^\d,.-]/g, "").replace(",", ".");
      const n = parseFloat(cleaned);
      return n;
    },
    // Formata número como moeda brasileira. Retorna "" se valor for null/NaN
    // (mantém o comportamento da planilha de deixar a célula vazia).
    formatCurrency(value, { emptyIfZeroOrNull = false } = {}) {
      if (value === null || value === undefined || isNaN(value)) {
        return emptyIfZeroOrNull ? "" : "R$ 0,00";
      }
      if (emptyIfZeroOrNull && value === 0) return "";
      return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    },
    todayISO() {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    },
    // Converte 'YYYY-MM-DD' (input type=date) para exibição DD/MM/AAAA.
    formatDateBR(isoDate) {
      if (!isoDate) return "—";
      const [y, m, d] = isoDate.split("-");
      if (!y || !m || !d) return "—";
      return `${d}/${m}/${y}`;
    },
    // Diferença em dias inteiros entre hoje e uma data ISO (positivo = passado).
    daysSince(isoDate) {
      if (!isoDate) return null;
      const today = new Date(Util.todayISO() + "T00:00:00");
      const then = new Date(isoDate + "T00:00:00");
      const diffMs = today - then;
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    },
    uid() {
      return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    },
    escapeHtml(str) {
      return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }
  };

  /* =====================================================================
     4. REGRAS DE NEGÓCIO (equivalente às fórmulas da planilha)
     ===================================================================== */
  const Business = {
    // Busca exata do produto pelo nome — equivalente ao PROCV(C3;PRODUTO!B:C;2;FALSO)
    lookupProduto(produtos, nomeSabor) {
      if (!nomeSabor) return null;
      return produtos.find(p => p.produto === nomeSabor) || null;
    },
    // VALOR: obtido dinamicamente do produto selecionado (recalcula sempre,
    // assim como a fórmula PROCV recalcularia se o valor do produto mudasse).
    computeValor(produtos, nomeSabor) {
      const produto = Business.lookupProduto(produtos, nomeSabor);
      return produto ? Number(produto.valor) : null;
    },
    // TAMANHO: identificado pelo texto do nome do produto — equivalente à
    // fórmula =SE(REGEXMATCH(C3;"350G");"PEQUENA";SE(REGEXMATCH(C3;"750G");"GRANDE";""))
    computeTamanho(nomeSabor) {
      if (!nomeSabor) return "";
      if (/350G/i.test(nomeSabor)) return "PEQUENA";
      if (/750G/i.test(nomeSabor)) return "GRANDE";
      return "";
    },
    // Status visual da linha, seguindo a prioridade:
    // PAGO (verde+tachado) > DEVENDO (vermelho) > AGUARDANDO atrasado (amarelo) > normal.
    // A planilha não define o que ocorre em caso de sobreposição de regras;
    // esta ordem foi escolhida por ser a mais segura: um pedido já concluído
    // (PAGO) nunca deve continuar sinalizando atraso.
    getRowStatus(pedido) {
      const diasAtraso = pedido.entrega ? Util.daysSince(pedido.entrega) - PRAZO_DIAS : null;
      const emAtraso = pedido.pagamento === "AGUARDANDO" && pedido.entrega !== "" && pedido.entrega != null && diasAtraso !== null && diasAtraso > 0;

      if (pedido.pagamento === "PAGO") {
        return { rowClass: "row-pago", badgeClass: "badge-pago", badgeLabel: "Pago", emAtraso: false, diasAtraso: null };
      }
      if (pedido.pagamento === "DEVENDO") {
        return { rowClass: "row-devendo", badgeClass: "badge-devendo", badgeLabel: "Devendo", emAtraso: false, diasAtraso: null };
      }
      if (emAtraso) {
        return { rowClass: "row-atraso", badgeClass: "badge-atraso", badgeLabel: "Atrasado", emAtraso: true, diasAtraso };
      }
      return { rowClass: "", badgeClass: "badge-aguardando", badgeLabel: "Aguardando", emAtraso: false, diasAtraso: null };
    },
    // Totais do dashboard.
    // NOTA SOBRE CONFLITO ENTRE ARQUIVOS:
    // A documentação da planilha diz que os totais devem ficar VAZIOS quando
    // não há valores (em vez de "R$ 0,00"). Já o PROMPT DE DESENVOLVIMENTO
    // pede explicitamente que o Dashboard mostre "R$ 0,00" quando não houver
    // valores. Como o Dashboard é uma tela nova (não existe na planilha),
    // seguimos a instrução do prompt de desenvolvimento para esta tela e
    // exibimos sempre "R$ 0,00" quando o total for zero.
    computeTotals(produtos, pedidos) {
      let totalReceber = 0;
      let totalPago = 0;
      let aguardando = 0, devendo = 0, pagos = 0, atrasados = 0;

      pedidos.forEach(p => {
        const valor = Business.computeValor(produtos, p.sabor) || 0;
        const status = Business.getRowStatus(p);
        if (p.pagamento === "PAGO") {
          totalPago += valor;
          pagos++;
        } else if (p.pagamento === "DEVENDO") {
          totalReceber += valor;
          devendo++;
        } else { // AGUARDANDO
          totalReceber += valor;
          aguardando++;
          if (status.emAtraso) atrasados++;
        }
      });

      return { totalReceber, totalPago, totalPedidos: pedidos.length, aguardando, devendo, pagos, atrasados };
    }
  };

  /* =====================================================================
     5. ESTADO DA APLICAÇÃO
     ===================================================================== */
  const state = {
    produtos: [],
    pedidos: [],
    currentView: "dashboard",
    pedidoFilters: { search: "", status: "", tamanho: "", sort: "numero_desc" },
    produtoFilters: { search: "" },
    confirmCallback: null
  };

  function loadState() {
    state.produtos = Storage.getProdutos();
    state.pedidos = Storage.getPedidos();
  }

  /* =====================================================================
     6. TOASTS
     ===================================================================== */
  function toast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    const el = document.createElement("div");
    el.className = "toast" + (type === "error" ? " toast-error" : "");
    el.textContent = message;
    container.appendChild(el);
    setTimeout(() => el.remove(), 3200);
  }

  /* =====================================================================
     7. NAVEGAÇÃO ENTRE VIEWS
     ===================================================================== */
  function setView(viewName) {
    state.currentView = viewName;
    document.querySelectorAll(".view").forEach(v => v.classList.remove("is-active"));
    document.getElementById("view-" + viewName).classList.add("is-active");

    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.view === viewName);
    });
    document.querySelectorAll(".tab-item").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.view === viewName);
    });

    if (viewName === "dashboard") renderDashboard();
    if (viewName === "pedidos") renderPedidos();
    if (viewName === "produtos") renderProdutos();
  }

  /* =====================================================================
     8. RENDER: DASHBOARD
     ===================================================================== */
  function renderDashboard() {
    const totals = Business.computeTotals(state.produtos, state.pedidos);

    document.getElementById("statTotalReceber").textContent = Util.formatCurrency(totals.totalReceber);
    document.getElementById("statTotalPago").textContent = Util.formatCurrency(totals.totalPago);
    document.getElementById("statTotalPedidos").textContent = totals.totalPedidos;
    document.getElementById("statAguardando").textContent = totals.aguardando;
    document.getElementById("statAtrasados").textContent = totals.atrasados;
    document.getElementById("statDevendo").textContent = totals.devendo;
    document.getElementById("statPagos").textContent = totals.pagos;

    const todayLabel = document.getElementById("todayLabel");
    const [y, m, d] = Util.todayISO().split("-");
    todayLabel.textContent = `Hoje: ${d}/${m}/${y}`;

    // Tabela de pedidos em atraso
    const tbody = document.querySelector("#tableAtrasados tbody");
    tbody.innerHTML = "";
    const atrasados = state.pedidos
      .map(p => ({ pedido: p, status: Business.getRowStatus(p) }))
      .filter(x => x.status.emAtraso)
      .sort((a, b) => b.status.diasAtraso - a.status.diasAtraso);

    document.getElementById("emptyAtrasados").hidden = atrasados.length > 0;

    atrasados.forEach(({ pedido, status }) => {
      const valor = Business.computeValor(state.produtos, pedido.sabor);
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${pedido.numero}</td>
        <td>${Util.escapeHtml(pedido.nome)}</td>
        <td>${Util.escapeHtml(pedido.sabor)}</td>
        <td class="col-num">${Util.formatCurrency(valor)}</td>
        <td>${Util.formatDateBR(pedido.entrega)}</td>
        <td class="col-num">${status.diasAtraso} dia(s)</td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* =====================================================================
     9. RENDER: PEDIDOS
     ===================================================================== */
  function getFilteredSortedPedidos() {
    const { search, status, tamanho, sort } = state.pedidoFilters;
    const searchLower = search.trim().toLowerCase();

    let list = state.produtos.length >= 0 ? [...state.pedidos] : [];

    list = list.filter(p => {
      const matchesSearch = !searchLower ||
        p.nome.toLowerCase().includes(searchLower) ||
        p.sabor.toLowerCase().includes(searchLower);
      const matchesStatus = !status || p.pagamento === status;
      const pTamanho = Business.computeTamanho(p.sabor);
      const matchesTamanho = !tamanho || pTamanho === tamanho;
      return matchesSearch && matchesStatus && matchesTamanho;
    });

    switch (sort) {
      case "numero_asc": list.sort((a, b) => a.numero - b.numero); break;
      case "numero_desc": list.sort((a, b) => b.numero - a.numero); break;
      case "nome_asc": list.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")); break;
      case "entrega_asc":
        list.sort((a, b) => {
          if (!a.entrega) return 1;
          if (!b.entrega) return -1;
          return a.entrega.localeCompare(b.entrega);
        });
        break;
    }
    return list;
  }

  function renderPedidos() {
    const tbody = document.querySelector("#tablePedidos tbody");
    tbody.innerHTML = "";
    const list = getFilteredSortedPedidos();

    document.getElementById("emptyPedidos").hidden = state.pedidos.length > 0;

    list.forEach(pedido => {
      const valor = Business.computeValor(state.produtos, pedido.sabor);
      const tamanho = Business.computeTamanho(pedido.sabor);
      const status = Business.getRowStatus(pedido);

      const tr = document.createElement("tr");
      if (status.rowClass) tr.classList.add(status.rowClass);

      tr.innerHTML = `
        <td>${pedido.numero}</td>
        <td>${Util.escapeHtml(pedido.nome)}</td>
        <td>${Util.escapeHtml(pedido.sabor)}</td>
        <td class="col-num">${Util.formatCurrency(valor, { emptyIfZeroOrNull: true })}</td>
        <td>${tamanho || "—"}</td>
        <td>${Util.formatDateBR(pedido.pedido)}</td>
        <td>${pedido.entrega ? Util.formatDateBR(pedido.entrega) : "—"}</td>
        <td>
          <select class="status-select" data-action="change-status" data-id="${pedido.id}">
            <option value="AGUARDANDO" ${pedido.pagamento === "AGUARDANDO" ? "selected" : ""}>Aguardando</option>
            <option value="PAGO" ${pedido.pagamento === "PAGO" ? "selected" : ""}>Pago</option>
            <option value="DEVENDO" ${pedido.pagamento === "DEVENDO" ? "selected" : ""}>Devendo</option>
          </select>
          ${status.emAtraso ? `<span class="badge badge-atraso" style="margin-left:6px;">Atrasado</span>` : ""}
        </td>
        <td class="col-actions">
          <div class="row-actions">
            <button class="icon-btn" title="Editar" data-action="edit-pedido" data-id="${pedido.id}">✎</button>
            <button class="icon-btn" title="Excluir" data-action="delete-pedido" data-id="${pedido.id}">🗑</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  /* =====================================================================
     10. RENDER: PRODUTOS
     ===================================================================== */
  function renderProdutos() {
    const tbody = document.querySelector("#tableProdutos tbody");
    tbody.innerHTML = "";
    const searchLower = state.produtoFilters.search.trim().toLowerCase();

    const list = state.produtos
      .filter(p => !searchLower || p.produto.toLowerCase().includes(searchLower))
      .sort((a, b) => a.produto.localeCompare(b.produto, "pt-BR"));

    document.getElementById("emptyProdutos").hidden = state.produtos.length > 0;

    list.forEach(produto => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${Util.escapeHtml(produto.cod)}</td>
        <td>${Util.escapeHtml(produto.produto)}</td>
        <td class="col-num">${Util.formatCurrency(Number(produto.valor))}</td>
        <td class="col-actions">
          <div class="row-actions">
            <button class="icon-btn" title="Editar" data-action="edit-produto" data-id="${produto.cod}">✎</button>
            <button class="icon-btn" title="Excluir" data-action="delete-produto" data-id="${produto.cod}">🗑</button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    fillSaborSelect();
  }

  // Preenche o <select> de sabor no formulário de pedido com os produtos atuais.
  function fillSaborSelect() {
    const select = document.getElementById("pedidoSabor");
    const currentValue = select.value;
    select.innerHTML = `<option value="">Selecione um produto...</option>`;
    state.produtos
      .slice()
      .sort((a, b) => a.produto.localeCompare(b.produto, "pt-BR"))
      .forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.produto;
        opt.textContent = `${p.produto} — ${Util.formatCurrency(Number(p.valor))}`;
        select.appendChild(opt);
      });
    if (currentValue) select.value = currentValue;
  }

  /* =====================================================================
     11. MODAIS — PEDIDO
     ===================================================================== */
  function openPedidoModal(pedidoId = null) {
    const form = document.getElementById("formPedido");
    form.reset();
    document.getElementById("pedidoFormError").textContent = "";
    fillSaborSelect();

    if (pedidoId) {
      const pedido = state.pedidos.find(p => p.id === pedidoId);
      if (!pedido) return;
      document.getElementById("modalPedidoTitle").textContent = "Editar pedido";
      document.getElementById("pedidoId").value = pedido.id;
      document.getElementById("pedidoNome").value = pedido.nome;
      document.getElementById("pedidoSabor").value = pedido.sabor;
      document.getElementById("pedidoDataPedido").value = pedido.pedido;
      document.getElementById("pedidoDataEntrega").value = pedido.entrega || "";
      document.getElementById("pedidoPagamento").value = pedido.pagamento;
    } else {
      document.getElementById("modalPedidoTitle").textContent = "Novo pedido";
      document.getElementById("pedidoId").value = "";
      document.getElementById("pedidoDataPedido").value = Util.todayISO();
      document.getElementById("pedidoPagamento").value = "AGUARDANDO";
    }
    updatePedidoPreview();
    showModal("modalPedido");
  }

  // Atualiza os campos de valor/tamanho somente-leitura conforme o sabor escolhido.
  function updatePedidoPreview() {
    const sabor = document.getElementById("pedidoSabor").value;
    const valor = Business.computeValor(state.produtos, sabor);
    const tamanho = Business.computeTamanho(sabor);
    document.getElementById("pedidoValorPreview").value = valor !== null ? Util.formatCurrency(valor) : "";
    document.getElementById("pedidoTamanhoPreview").value = tamanho || "";
  }

  function savePedidoForm(e) {
    e.preventDefault();
    const errorEl = document.getElementById("pedidoFormError");
    errorEl.textContent = "";

    const id = document.getElementById("pedidoId").value;
    const nome = document.getElementById("pedidoNome").value.trim();
    const sabor = document.getElementById("pedidoSabor").value;
    const dataPedido = document.getElementById("pedidoDataPedido").value;
    const dataEntrega = document.getElementById("pedidoDataEntrega").value;
    const pagamento = document.getElementById("pedidoPagamento").value;

    // Validações
    if (!nome) { errorEl.textContent = "Informe o nome do cliente."; return; }
    if (!sabor) { errorEl.textContent = "Selecione um sabor/produto."; return; }
    if (!dataPedido) { errorEl.textContent = "Informe a data do pedido."; return; }
    if (dataEntrega && dataEntrega < dataPedido) {
      errorEl.textContent = "A data de entrega não pode ser anterior à data do pedido.";
      return;
    }

    if (id) {
      const pedido = state.pedidos.find(p => p.id === id);
      Object.assign(pedido, { nome, sabor, pedido: dataPedido, entrega: dataEntrega || null, pagamento });
      toast("Pedido atualizado com sucesso.");
    } else {
      const nextNumero = state.pedidos.reduce((max, p) => Math.max(max, p.numero), 0) + 1;
      state.pedidos.push({
        id: Util.uid(),
        numero: nextNumero,
        nome, sabor,
        pedido: dataPedido,
        entrega: dataEntrega || null,
        pagamento
      });
      toast("Pedido criado com sucesso.");
    }

    Storage.savePedidos(state.pedidos);
    closeModals();
    renderPedidos();
    if (state.currentView === "dashboard") renderDashboard();
  }

  /* =====================================================================
     12. MODAIS — PRODUTO
     ===================================================================== */
  function openProdutoModal(cod = null) {
    const form = document.getElementById("formProduto");
    form.reset();
    document.getElementById("produtoFormError").textContent = "";

    if (cod) {
      const produto = state.produtos.find(p => p.cod === cod);
      if (!produto) return;
      document.getElementById("modalProdutoTitle").textContent = "Editar produto";
      document.getElementById("produtoId").value = produto.cod;
      document.getElementById("produtoCod").value = produto.cod;
      document.getElementById("produtoCod").disabled = true;
      document.getElementById("produtoNome").value = produto.produto;
      document.getElementById("produtoValor").value = String(produto.valor).replace(".", ",");
    } else {
      document.getElementById("modalProdutoTitle").textContent = "Novo produto";
      document.getElementById("produtoId").value = "";
      document.getElementById("produtoCod").disabled = false;
    }
    showModal("modalProduto");
  }

  function saveProdutoForm(e) {
    e.preventDefault();
    const errorEl = document.getElementById("produtoFormError");
    errorEl.textContent = "";

    const editingId = document.getElementById("produtoId").value;
    let cod = document.getElementById("produtoCod").value.trim();
    const nome = document.getElementById("produtoNome").value.trim();
    const valor = Util.parseValorInput(document.getElementById("produtoValor").value);

    if (!nome) { errorEl.textContent = "Informe o nome do produto."; return; }
    if (isNaN(valor) || valor < 0) { errorEl.textContent = "Informe um valor numérico válido."; return; }

    if (!editingId) {
      // gera código automático se vazio
      if (!cod) {
        const maxCod = state.produtos.reduce((max, p) => Math.max(max, parseInt(p.cod, 10) || 0), 0);
        cod = String(maxCod + 1);
      }
      if (state.produtos.some(p => p.cod === cod)) {
        errorEl.textContent = `Já existe um produto com o código "${cod}".`;
        return;
      }
      state.produtos.push({ cod, produto: nome, valor: Math.round(valor * 100) / 100 });
      toast("Produto cadastrado com sucesso.");
    } else {
      const produto = state.produtos.find(p => p.cod === editingId);
      const oldNome = produto.produto;
      produto.produto = nome;
      produto.valor = Math.round(valor * 100) / 100;
      // Como o SABOR do pedido guarda o nome do produto (igual à planilha,
      // que usa o nome como referência da lista suspensa), atualizamos os
      // pedidos existentes que apontam para o nome antigo.
      if (oldNome !== nome) {
        state.pedidos.forEach(p => { if (p.sabor === oldNome) p.sabor = nome; });
        Storage.savePedidos(state.pedidos);
      }
      toast("Produto atualizado com sucesso.");
    }

    Storage.saveProdutos(state.produtos);
    closeModals();
    renderProdutos();
    renderPedidos();
    if (state.currentView === "dashboard") renderDashboard();
  }

  /* =====================================================================
     13. EXCLUSÃO COM CONFIRMAÇÃO
     ===================================================================== */
  function openConfirm(message, onConfirm) {
    document.getElementById("confirmMessage").textContent = message;
    state.confirmCallback = onConfirm;
    showModal("modalConfirm");
  }

  function deletePedido(id) {
    openConfirm("Tem certeza que deseja excluir este pedido? Esta ação não pode ser desfeita.", () => {
      state.pedidos = state.pedidos.filter(p => p.id !== id);
      Storage.savePedidos(state.pedidos);
      renderPedidos();
      if (state.currentView === "dashboard") renderDashboard();
      toast("Pedido excluído.");
    });
  }

  function deleteProduto(cod) {
    const emUso = state.pedidos.some(p => {
      const produto = state.produtos.find(prod => prod.cod === cod);
      return produto && p.sabor === produto.produto;
    });
    const msg = emUso
      ? "Este produto está sendo usado em pedidos existentes. Os pedidos manterão o nome do sabor, mas o valor não será mais calculado automaticamente. Deseja continuar?"
      : "Tem certeza que deseja excluir este produto?";
    openConfirm(msg, () => {
      state.produtos = state.produtos.filter(p => p.cod !== cod);
      Storage.saveProdutos(state.produtos);
      renderProdutos();
      renderPedidos();
      if (state.currentView === "dashboard") renderDashboard();
      toast("Produto excluído.");
    });
  }

  /* =====================================================================
     14. IMPORTAÇÃO / EXPORTAÇÃO JSON
     ===================================================================== */
  function exportJSON() {
    const payload = {
      exportedAt: new Date().toISOString(),
      produtos: state.produtos,
      pedidos: state.pedidos
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cucas-backup-${Util.todayISO()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Backup exportado com sucesso.");
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data.produtos) || !Array.isArray(data.pedidos)) {
          throw new Error("Formato inválido.");
        }
        openConfirm(
          "Importar este arquivo substituirá todos os produtos e pedidos atuais. Deseja continuar?",
          () => {
            state.produtos = data.produtos;
            state.pedidos = data.pedidos;
            Storage.saveProdutos(state.produtos);
            Storage.savePedidos(state.pedidos);
            renderProdutos();
            renderPedidos();
            renderDashboard();
            toast("Dados importados com sucesso.");
          }
        );
      } catch (err) {
        toast("Não foi possível importar o arquivo. Verifique se é um backup válido gerado pelo próprio sistema.", "error");
      }
    };
    reader.readAsText(file);
  }

  /* =====================================================================
     15. MODAL HELPERS
     ===================================================================== */
  function showModal(id) {
    document.getElementById(id).hidden = false;
  }
  function closeModals() {
    document.querySelectorAll(".modal-overlay").forEach(m => (m.hidden = true));
    state.confirmCallback = null;
  }

  /* =====================================================================
     16. WIRING DE EVENTOS
     ===================================================================== */
  function wireEvents() {
    // Navegação
    document.querySelectorAll(".nav-item, .tab-item").forEach(btn => {
      btn.addEventListener("click", () => setView(btn.dataset.view));
    });

    // Fechar modais
    document.querySelectorAll("[data-close-modal]").forEach(btn => {
      btn.addEventListener("click", closeModals);
    });
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => { if (e.target === overlay) closeModals(); });
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModals(); });

    // Pedido: abrir novo / editar / preview / salvar
    document.getElementById("btnNovoPedido").addEventListener("click", () => openPedidoModal());
    document.getElementById("pedidoSabor").addEventListener("change", updatePedidoPreview);
    document.getElementById("formPedido").addEventListener("submit", savePedidoForm);

    // Produto: abrir novo / editar / salvar
    document.getElementById("btnNovoProduto").addEventListener("click", () => openProdutoModal());
    document.getElementById("formProduto").addEventListener("submit", saveProdutoForm);

    // Confirmação genérica
    document.getElementById("confirmActionBtn").addEventListener("click", () => {
      if (typeof state.confirmCallback === "function") state.confirmCallback();
      closeModals();
    });

    // Delegação de eventos na tabela de pedidos (editar / excluir / status)
    document.querySelector("#tablePedidos tbody").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const id = btn.dataset.id;
      if (btn.dataset.action === "edit-pedido") openPedidoModal(id);
      if (btn.dataset.action === "delete-pedido") deletePedido(id);
    });
    document.querySelector("#tablePedidos tbody").addEventListener("change", (e) => {
      const sel = e.target.closest('[data-action="change-status"]');
      if (!sel) return;
      const pedido = state.pedidos.find(p => p.id === sel.dataset.id);
      pedido.pagamento = sel.value;
      Storage.savePedidos(state.pedidos);
      renderPedidos();
      if (state.currentView === "dashboard") renderDashboard();
      toast("Status de pagamento atualizado.");
    });

    // Delegação de eventos na tabela de produtos
    document.querySelector("#tableProdutos tbody").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const cod = btn.dataset.id;
      if (btn.dataset.action === "edit-produto") openProdutoModal(cod);
      if (btn.dataset.action === "delete-produto") deleteProduto(cod);
    });

    // Filtros de pedidos
    document.getElementById("pedidoSearch").addEventListener("input", (e) => {
      state.pedidoFilters.search = e.target.value; renderPedidos();
    });
    document.getElementById("filterStatus").addEventListener("change", (e) => {
      state.pedidoFilters.status = e.target.value; renderPedidos();
    });
    document.getElementById("filterTamanho").addEventListener("change", (e) => {
      state.pedidoFilters.tamanho = e.target.value; renderPedidos();
    });
    document.getElementById("sortPedidos").addEventListener("change", (e) => {
      state.pedidoFilters.sort = e.target.value; renderPedidos();
    });

    // Filtro de produtos
    document.getElementById("produtoSearch").addEventListener("input", (e) => {
      state.produtoFilters.search = e.target.value; renderProdutos();
    });

    // Importação / exportação
    document.getElementById("btnExport").addEventListener("click", exportJSON);
    document.getElementById("fileImport").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) importJSON(file);
      e.target.value = "";
    });
  }

  /* =====================================================================
     17. INICIALIZAÇÃO
     ===================================================================== */
  function init() {
    Storage.ensureSeed();
    loadState();
    wireEvents();
    setView("dashboard");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
