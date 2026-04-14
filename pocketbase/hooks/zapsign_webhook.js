routerAdd('POST', '/backend/v1/hooks/zapsign', (e) => {
  try {
    const reqInfo = $apis.requestInfo(e)
    const body = reqInfo.body || {}

    if (!body.event_type || !body.token) {
      return e.json(400, { message: 'Payload invalido' })
    }

    if (body.event_type !== 'doc_signed') {
      return e.json(200, { message: 'Evento ignorado' })
    }

    let signer = body.signer_who_signed
    if (!signer && body.signers && Array.isArray(body.signers)) {
      signer = body.signers.find((s) => s.status === 'signed')
    }

    if (!signer) {
      return e.json(200, { message: 'Nenhum signatario encontrado no payload' })
    }

    let cpfCnpj = ''
    if (signer.cpf) {
      cpfCnpj = signer.cpf
    } else if (signer.cnpj) {
      cpfCnpj = signer.cnpj
    } else if (
      signer.extra_docs &&
      Array.isArray(signer.extra_docs) &&
      signer.extra_docs.length > 0
    ) {
      cpfCnpj = signer.extra_docs[0].value || ''
    }

    let dataAssinatura = signer.signed_at
    if (!dataAssinatura) {
      dataAssinatura = new Date().toISOString().replace('T', ' ')
    }

    const col = $app.findCollectionByNameOrId('contratos_assinados')
    const record = new Record(col)

    record.set('zapsign_token', body.token || '')
    record.set('nome_signatario', signer.name || '')
    record.set('cpf', cpfCnpj || '')
    record.set('email', signer.email || '')
    record.set('telefone', signer.phone_number || '')
    record.set('url_pdf', body.signed_file || '')
    record.set('status', 'pendente_processamento')
    record.set('dados_webhook', body)
    record.set('data_assinatura', dataAssinatura)

    $app.save(record)

    console.log('ZapSign webhook processed:', record.id)

    return e.json(200, { id: record.id })
  } catch (err) {
    console.log('zapsign-webhook error:', err)
    return e.json(500, { message: 'Erro ao processar webhook' })
  }
})
