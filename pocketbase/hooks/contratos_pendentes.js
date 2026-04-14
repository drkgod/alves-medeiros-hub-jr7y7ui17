routerAdd('GET', '/backend/v1/hooks/contratos-pendentes', (e) => {
  const apiKey = e.request.header.get('x-api-key') || e.requestInfo().headers['x_api_key']
  if (apiKey !== 'WORKSPACE_BRIDGE_KEY_2026') {
    throw new UnauthorizedError('Nao autorizado')
  }

  const records = $app.findRecordsByFilter(
    'contratos_assinados',
    "status = 'pendente_processamento'",
    'created',
    50,
    0,
  )

  const result = records.map((r) => ({
    id: r.id,
    zapsign_token: r.getString('zapsign_token'),
    nome_signatario: r.getString('nome_signatario'),
    cpf: r.getString('cpf'),
    email: r.getString('email'),
    telefone: r.getString('telefone'),
    url_pdf: r.getString('url_pdf'),
    status: r.getString('status'),
    data_assinatura: r.getString('data_assinatura'),
    created: r.getString('created'),
  }))

  return e.json(200, result)
})
