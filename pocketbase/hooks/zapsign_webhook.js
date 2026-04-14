routerAdd('POST', '/backend/v1/hooks/zapsign', function (e) {
  try {
    const info = $apis.requestInfo(e)
    const body = info.body || {}

    if (body.event_type !== 'doc_signed') {
      return e.json(200, { message: 'Evento ignorado' })
    }

    const token = body.token
    if (!token) {
      return e.json(400, { message: 'Payload invalido' })
    }

    try {
      const existing = $app.findFirstRecordByData('contratos_assinados', 'zapsign_token', token)
      if (existing) {
        return e.json(200, { message: 'Contrato ja processado' })
      }
    } catch (_) {
      // Nao encontrado, processa normalmente
    }

    let pdfUrl = ''
    if (body.signed_file && body.signed_file.signed_file_url) {
      pdfUrl = body.signed_file.signed_file_url
    } else if (body.signed_file_url) {
      pdfUrl = body.signed_file_url
    } else if (body.original_file && body.original_file.original_file_url) {
      pdfUrl = body.original_file.original_file_url
    }

    let nome = ''
    let email = ''
    let telefone = ''
    let cpf = ''
    let dataAssinatura = ''

    if (body.signers && Array.isArray(body.signers) && body.signers.length > 0) {
      const signer = body.signers[0]
      nome = signer.name || ''
      email = signer.email || ''
      telefone = signer.phone_number || signer.phone || ''

      if (signer.cpf) {
        cpf = signer.cpf
      } else if (signer.documentation) {
        cpf = signer.documentation
      }

      if (signer.signed_at) {
        dataAssinatura = signer.signed_at
      }
    }

    if (!dataAssinatura) {
      dataAssinatura = new Date().toISOString().replace('T', ' ')
    }

    const col = $app.findCollectionByNameOrId('contratos_assinados')
    const record = new Record(col)

    record.set('zapsign_token', token)
    record.set('nome_signatario', nome)
    record.set('cpf', cpf)
    record.set('email', email)
    record.set('telefone', telefone)
    record.set('url_pdf', pdfUrl)
    record.set('status', 'pendente_processamento')
    record.set('dados_webhook', body)
    record.set('data_assinatura', dataAssinatura)

    let pdfStored = false

    if (pdfUrl) {
      const res = $http.send({
        url: pdfUrl,
        method: 'GET',
        timeout: 30,
      })

      if (res.statusCode === 200 && res.body) {
        const fileName = 'contrato_' + token + '.pdf'
        const file = $filesystem.fileFromBytes(res.body, fileName)
        record.set('arquivo_pdf', file)
        pdfStored = true
      }
    }

    $app.save(record)

    console.log('ZapSign webhook OK:', record.id)

    return e.json(200, { id: record.id, pdf_stored: pdfStored })
  } catch (err) {
    console.log('zapsign-webhook error:', String(err))
    return e.json(500, { message: 'Erro ao processar webhook', detail: String(err) })
  }
})
