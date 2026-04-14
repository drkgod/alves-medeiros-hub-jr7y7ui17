routerAdd('POST', '/backend/v1/hooks/zapsign', function (e) {
  try {
    var body = null
    try {
      body = e.requestInfo().body
      if (!body || Object.keys(body).length === 0) {
        throw new Error('Empty body, attempting fallback')
      }
    } catch (err1) {
      try {
        var str = readerToString(e.request.body)
        if (str) {
          body = JSON.parse(str)
        }
      } catch (err2) {
        // Fallback failed
      }
    }

    if (!body) {
      return e.json(400, { message: 'Nao foi possivel ler o body da requisicao' })
    }

    if (!body.event_type || !body.token) {
      return e.json(400, { message: 'Payload invalido' })
    }

    if (body.event_type !== 'doc_signed') {
      return e.json(200, { message: 'Evento ignorado' })
    }

    try {
      $app.findFirstRecordByData('contratos_assinados', 'zapsign_token', body.token)
      return e.json(200, { message: 'Contrato ja processado' })
    } catch (findErr) {
      // Record does not exist, safe to proceed
    }

    var signer = body.signer_who_signed
    if (!signer && body.signers && Array.isArray(body.signers)) {
      signer = body.signers.find(function (s) {
        return s.status === 'signed'
      })
    }

    if (!signer) {
      signer = {}
    }

    var cpf = signer.cpf || signer.cnpj || ''
    if (
      !cpf &&
      signer.extra_docs &&
      Array.isArray(signer.extra_docs) &&
      signer.extra_docs.length > 0
    ) {
      cpf = signer.extra_docs[0]
    }

    var dataAssinatura = signer.signed_at
    if (!dataAssinatura) {
      dataAssinatura = new Date().toISOString().replace('T', ' ')
    }

    var pdfUrl = ''
    if (body.signed_file) {
      if (typeof body.signed_file === 'string') {
        pdfUrl = body.signed_file
      } else if (body.signed_file.signed_file_url) {
        pdfUrl = body.signed_file.signed_file_url
      }
    }
    if (!pdfUrl && body.signed_file_url) {
      pdfUrl = body.signed_file_url
    }

    var col = $app.findCollectionByNameOrId('contratos_assinados')
    var record = new Record(col)

    record.set('zapsign_token', body.token)
    record.set('nome_signatario', signer.name || '')
    record.set('cpf', cpf)
    record.set('email', signer.email || '')
    record.set('telefone', signer.phone_number || signer.phone || '')
    record.set('url_pdf', pdfUrl)
    record.set('status', 'pendente_processamento')
    record.set('dados_webhook', JSON.stringify(body))
    record.set('data_assinatura', dataAssinatura)

    $app.save(record)

    console.log('ZapSign webhook OK:', record.id)

    return e.json(200, { id: record.id })
  } catch (err) {
    console.log('zapsign-webhook error:', err, err.message)
    return e.json(500, { message: 'Erro ao processar webhook', detail: String(err) })
  }
})
