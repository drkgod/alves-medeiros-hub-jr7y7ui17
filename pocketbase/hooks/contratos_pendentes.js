routerAdd('GET', '/backend/v1/hooks/contratos-pendentes', (e) => {
  try {
    const info = $apis.requestInfo(e)
    const apiKey = info.headers['x-api-key'] || info.headers['x_api_key']

    const validKey = $secrets.get('WORKSPACE_BRIDGE_KEY') || 'WORKSPACE_BRIDGE_KEY_2026'

    if (apiKey !== validKey) {
      return e.json(401, { message: 'Nao autorizado' })
    }

    const records = $app.findRecordsByFilter(
      'contratos_assinados',
      "status = 'pendente_processamento'",
      'created',
      50,
      0,
    )

    const result = records.map(function (r) {
      return {
        id: r.id,
        zapsign_token: r.getString('zapsign_token'),
        nome_signatario: r.getString('nome_signatario'),
        cpf: r.getString('cpf'),
        email: r.getString('email'),
        telefone: r.getString('telefone'),
        url_pdf: r.getString('