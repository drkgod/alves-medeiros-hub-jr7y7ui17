routerAdd('POST', '/backend/v1/hooks/zapsign', (e) => {
  const secret =
    e.request.header.get('x-webhook-secret') || e.requestInfo().headers['x_webhook_secret']
  if (secret !== 'ZAPSIGN_SECRET_2026') {
    throw new UnauthorizedError('Nao autorizado')
  }

  const body = e.requestInfo().body || {}

  if (body.event_type !== 'doc_signed' && body.status !== 'signed') {
    return e.json(200, { message: 'Evento ignorado' })
  }

  try {
    const token = body.token
    const url_pdf = body.signed_file || ''

    let signer = null
    if (body.signers && Array.isArray(body.signers)) {
      signer = body.signers.find((s) => s.status === 'signed')
    }

    if (!signer) {
      throw new Error('Nenhum signatário assinado encontrado')
    }

    let cpf = ''
    if (signer.cpf) {
      cpf = signer.cpf
    } else if (signer.extra_docs && Array.isArray(signer.extra_docs)) {
      const doc = signer.extra_docs.find((d) => true)
      cpf = doc ? doc.value : ''
    }

    const col = $app.findCollectionByNameOrId('contratos_assinados')
    const record = new Record(col)

    record.set('zapsign_token', token || '')
    record.set('nome_signatario', signer.name || '')
    record.set('cpf', cpf || '')
    record.set('email', signer.email || '')
    record.set('telefone', signer.phone_number || '')
    record.set('url_pdf', url_pdf)
    record.set('status', 'pendente_processamento')
    record.set('dados_webhook', body)
    record.set('data_assinatura', new Date().toISOString())

    $app.save(record)

    return e.json(200, { id: record.id })
  } catch (err) {
    return e.json(500, { message: 'Erro ao processar webhook' })
  }
})
