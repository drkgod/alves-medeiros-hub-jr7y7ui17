routerAdd('POST', '/backend/v1/hooks/zapsign', function (e) {
  try {
    var info = $apis.requestInfo(e)
    var body = info.body || {}

    if (body.event_type !== 'doc_signed') {
      return e.json(200, { message: 'Evento ignorado' })
    }

    var docToken = body.token
    if (!docToken) {
      return e.json(400, { message: 'Payload invalido' })
    }

    var existingRecords = null
    try {
      existingRecords = $app.findRecordsByFilter(
        'contratos_assinados',
        "zapsign_token = '" + docToken + "'",
        '',
        1,
        0,
      )
    } catch (findErr) {
      console.log('Error checking existing records:', String(findErr))
    }

    if (existingRecords && existingRecords.length > 0) {
      return e.json(200, { message: 'Contrato ja processado' })
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
    if (!pdfUrl && body.original_file) {
      if (typeof body.original_file === 'string') {
        pdfUrl = body.original_file
      } else if (body.original_file.original_file_url) {
        pdfUrl = body.original_file.original_file_url
      }
    }

    var nome = ''
    var email = ''
    var telefone = ''
    var cpf = ''
    var dataAssinatura = ''

    if (body.signers && Array.isArray(body.signers) && body.signers.length > 0) {
      var signer = body.signers[0]
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

    var col = $app.findCollectionByNameOrId('contratos_assinados')
    var record = new Record(col)

    record.set('zapsign_token', docToken)
    record.set('nome_signatario', nome)
    record.set('cpf', cpf)
    record.set('email', email)
    record.set('telefone', telefone)
    record.set('url_pdf', pdfUrl)
    record.set('status', 'pendente_processamento')
    record.set('dados_webhook', body)
    record.set('data_assinatura', dataAssinatura)

    var pdfStored = false

    if (pdfUrl) {
      try {
        var pdfRes = $http.send({
          url: pdfUrl,
          method: 'GET',
          timeout: 30,
        })

        if (pdfRes.statusCode === 200 && pdfRes.raw) {
          var fileName = 'contrato_' + docToken + '.pdf'
          var file = $filesystem.fileFromBytes(pdfRes.raw, fileName)
          record.set('arquivo_pdf', file)
          pdfStored = true
        } else {
          console.log(
            'zapsign-webhook download returned non-200 or missing raw data',
            String(pdfRes.statusCode),
          )
        }
      } catch (httpErr) {
        console.log('zapsign-webhook error downloading pdf:', String(httpErr))
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
