routerAdd('POST', '/backend/v1/hooks/consultar-advbox', (e) => {
  const apiKey = e.request.header.get('x-api-key') || e.requestInfo().headers['x_api_key']
  if (apiKey !== 'WORKSPACE_BRIDGE_KEY_2026') {
    throw new UnauthorizedError('Nao autorizado')
  }

  const body = e.requestInfo().body || {}
  if (!body.cpf) {
    throw new BadRequestError('CPF obrigatório')
  }

  const cleanCpf = String(body.cpf).replace(/\D/g, '')

  let configRecord
  try {
    configRecord = $app.findFirstRecordByFilter('configuracoes_usuario', "advbox_token != ''")
  } catch (err) {
    throw new BadRequestError('Token ADVBox nao configurado')
  }

  const token = configRecord.getString('advbox_token')

  try {
    const res = $http.send({
      url: `https://app.advbox.com.br/api/v1/customers?search=${cleanCpf}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 15,
    })

    if (res.statusCode === 401) {
      return e.json(502, { message: 'Token ADVBox invalido ou expirado' })
    }

    if (res.statusCode !== 200) {
      return e.json(502, { message: 'Nao foi possivel conectar ao ADVBox' })
    }

    const data = res.json || []
    const customers = Array.isArray(data) ? data : data.data || []

    if (customers.length === 0) {
      return e.json(200, { found: false })
    }

    const customer = customers[0]
    const customerId = customer.id

    const resLawsuits = $http.send({
      url: `https://app.advbox.com.br/api/v1/lawsuits?customer_id=${customerId}`,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 15,
    })

    let lawsuits = []
    if (resLawsuits.statusCode === 200) {
      const dataL = resLawsuits.json || []
      lawsuits = Array.isArray(dataL) ? dataL : dataL.data || []
    }

    return e.json(200, {
      found: true,
      customer: customer,
      lawsuits: lawsuits,
    })
  } catch (err) {
    return e.json(502, { message: 'Nao foi possivel conectar ao ADVBox' })
  }
})
