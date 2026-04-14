routerAdd('GET', '/backend/v1/hooks/contratos-pendentes', function (e) {
  try {
    var info = e.requestInfo()
    var headers = info.headers || {}
    var apiKey = headers['x-api-key'] || headers['x_api_key'] || ''

    var expectedKey = ''
    try {
      expectedKey = $secrets.get('WORKSPACE_BRIDGE_KEY') || 'WORKSPACE_BRIDGE_KEY_2026'
    } catch (_) {
      expectedKey = 'WORKSPACE_BRIDGE_KEY_2026'
    }

    if (apiKey !== expectedKey) {
      return e.json(401, { message: 'Nao autorizado' })
    }

    var records = $app.findRecordsByFilter(
      'contratos_assinados',
      "status = 'pendente_processamento'",
      'created',
      50,
      0,
    )

    var result = records.map(function (r) {
      var recordId = r.id
      var arquivoPdf = r.getString('arquivo_pdf')
      var urlPdf = r.getString('url_pdf')

      var pdfUrl = ''
      var pdfSource = 'none'

      if (arquivoPdf && arquivoPdf.length > 0) {
        pdfUrl = '/api/files/contratos_assinados/' + recordId + '/' + arquivoPdf
        pdfSource = 'local'
      } else if (urlPdf && urlPdf.length > 0) {
        pdfUrl = urlPdf
        pdfSource = 'zapsign'
      }

      return {
        id: recordId,
        zapsign_token: r.getString('zapsign_token'),
        nome_signatario: r.getString('nome_signatario'),
        cpf: r.getString('cpf'),
        email: r.getString('email'),
        telefone: r.getString('telefone'),
        url_pdf: pdfUrl,
        pdf_source: pdfSource,
        status: r.getString('status'),
        data_assinatura: r.getString('data_assinatura'),
        created: r.getString('created'),
      }
    })

    return e.json(200, result)
  } catch (err) {
    console.log('contratos-pendentes error:', err, err.message)
    return e.json(500, { message: 'Erro interno', detail: String(err) })
  }
})
