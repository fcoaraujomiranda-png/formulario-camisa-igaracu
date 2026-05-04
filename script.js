const numeroWhatsAppPedidos = "5586921434354";

// URL da implantação do Apps Script que registra os pedidos na planilha.
const googleSheetsURL = "https://script.google.com/macros/s/AKfycbwyeG-xpqvbkDBNFT7Lg2t2J2bIeFzDJCaYcOMQ5xWsTtOmTBOY_oFEbaj1UBpXvEh6/exec";

const form = document.getElementById("formularioVisivel");
const formEnvio = document.getElementById("formEnvioSheets");
const tamanho = document.getElementById("tamanho");
const especialBox = document.getElementById("especialBox");
const resumoPedido = document.getElementById("resumoPedido");
const copiarResumo = document.getElementById("copiarResumo");
const abrirWhatsApp = document.getElementById("abrirWhatsApp");
const statusEnvio = document.getElementById("statusEnvio");
const appConteudo = document.getElementById("appConteudo");
const paginaSucesso = document.getElementById("paginaSucesso");
const resumoSucesso = document.getElementById("resumoSucesso");
const abrirWhatsAppSucesso = document.getElementById("abrirWhatsAppSucesso");
const novoPedido = document.getElementById("novoPedido");

let codigoPedidoAtual = "";

tamanho.addEventListener("change", () => {
    especialBox.classList.toggle("hidden", tamanho.value !== "Tamanho especial");
});

function criarCodigoPedido() {
    if (codigoPedidoAtual) return codigoPedidoAtual;
    const agora = new Date();
    const data = agora.toLocaleDateString("pt-BR").split("/").reverse().join("");
    const hora = String(agora.getHours()).padStart(2, "0") + String(agora.getMinutes()).padStart(2, "0");
    const aleatorio = Math.floor(100 + Math.random() * 900);
    codigoPedidoAtual = `IG-${data}-${hora}${aleatorio}`;
    return codigoPedidoAtual;
}

function pegarDados() {
    return {
        codigoPedido: criarCodigoPedido(),
        nome: document.getElementById("nome").value.trim(),
        telefone: document.getElementById("telefone").value.trim(),
        whatsapp: document.getElementById("whatsapp").value,
        categoria: document.getElementById("categoria").value,
        tamanho: document.getElementById("tamanho").value,
        especial: document.getElementById("especial").value.trim(),
        quantidade: document.getElementById("quantidade").value,
        pagamento: document.getElementById("pagamento").value,
        statusPagamento: document.getElementById("statusPagamento").value,
        observacoes: document.getElementById("observacoes").value.trim(),
        dataHora: new Date().toLocaleString("pt-BR")
    };
}

function gerarResumo() {
    const dados = pegarDados();
    return `CONFIRMAÇÃO DE PEDIDO - CAMISA IGARAÇU 2026

` +
        `Código do pedido: ${dados.codigoPedido}
` +
        `Nome: ${dados.nome}
` +
        `Telefone: ${dados.telefone}
` +
        `É WhatsApp?: ${dados.whatsapp}
` +
        `Categoria: ${dados.categoria}
` +
        `Tamanho: ${dados.tamanho}${dados.especial ? ` - ${dados.especial}` : ""}
` +
        `Quantidade: ${dados.quantidade}
` +
        `Forma de pagamento: ${dados.pagamento}
` +
        `Status do pagamento: ${dados.statusPagamento}
` +
        `Observações: ${dados.observacoes || "Nenhuma"}
` +
        `Data do envio: ${dados.dataHora}

` +
        `Estou confirmando meu pedido da camisa oficial da Junina Igaraçu 2026.`;
}

async function enviarParaSheets() {
    const dados = pegarDados();
    formEnvio.action = googleSheetsURL;
    formEnvio.method = "POST";
    formEnvio.innerHTML = "";
    
    Object.entries(dados).forEach(([chave, valor]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = chave;
        input.value = valor;
        formEnvio.appendChild(input);
    });
    
    // Enviar o formulário
    formEnvio.submit();
    return "enviado";
}

function abrirConfirmacaoWhatsApp(resumo) {
    const link = `https://wa.me/${numeroWhatsAppPedidos}?text=${encodeURIComponent(resumo)}`;
    abrirWhatsApp.href = link;
    abrirWhatsAppSucesso.href = link;
    abrirWhatsApp.style.display = "block";
    const janela = window.open(link, "_blank");
    if (!janela) {
        statusEnvio.style.display = "block";
        statusEnvio.textContent = "Pedido gerado. Toque no botão verde para abrir o WhatsApp e finalizar a confirmação.";
    }
}

function mostrarPaginaSucesso(resumo) {
    appConteudo.classList.add("hidden");
    paginaSucesso.classList.remove("hidden");
    resumoSucesso.textContent = resumo;
    abrirWhatsAppSucesso.style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
}

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const resumo = gerarResumo();
    resumoPedido.style.display = "block";
    resumoPedido.textContent = resumo;
    statusEnvio.style.display = "block";
    statusEnvio.textContent = "Gerando confirmação do pedido...";

    try {
        const statusPlanilha = await enviarParaSheets();
        abrirConfirmacaoWhatsApp(resumo);
        mostrarPaginaSucesso(resumo);
        statusEnvio.textContent = statusPlanilha === "enviado"
            ? "Pedido registrado na planilha. Agora finalize enviando a mensagem no WhatsApp."
            : "Pedido pronto. Agora finalize enviando a mensagem no WhatsApp.";
    } catch (error) {
        abrirConfirmacaoWhatsApp(resumo);
        statusEnvio.textContent = "Não foi possível registrar na planilha, mas o WhatsApp foi aberto para confirmação do pedido.";
    }
});

novoPedido.addEventListener("click", () => {
    paginaSucesso.classList.add("hidden");
    appConteudo.classList.remove("hidden");
    form.reset();
    especialBox.classList.add("hidden");
    resumoPedido.style.display = "none";
    statusEnvio.style.display = "none";
    abrirWhatsApp.style.display = "none";
    window.scrollTo({ top: 0, behavior: "smooth" });
});

copiarResumo.addEventListener("click", async () => {
    const resumo = gerarResumo();
    resumoPedido.style.display = "block";
    resumoPedido.textContent = resumo;
    try {
        await navigator.clipboard.writeText(resumo);
        copiarResumo.textContent = "Resumo copiado!";
        setTimeout(() => copiarResumo.textContent = "Copiar resumo do pedido", 1800);
    } catch (error) {
        alert("Não foi possível copiar automaticamente. Selecione o resumo e copie manualmente.");
    }
});