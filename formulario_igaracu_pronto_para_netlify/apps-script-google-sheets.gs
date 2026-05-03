function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = e.parameter;

  sheet.appendRow([
    new Date(),
    data.codigoPedido || "",
    data.nome || "",
    data.telefone || "",
    data.whatsapp || "",
    data.categoria || "",
    data.tamanho || "",
    data.especial || "",
    data.quantidade || "",
    data.pagamento || "",
    data.statusPagamento || "",
    data.observacoes || "",
    data.dataHora || ""
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
