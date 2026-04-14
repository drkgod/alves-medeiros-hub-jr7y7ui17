routerAdd('POST', '/backend/v1/hooks/salvar-peticao', function (e) {
  try {
    let body = null
    let headers = {}

    try {
      const info = e.requestInfo()
      body = info.body
      headers = info.headers || {}
    } catch (errInfo) {
      try {
        const rawBody = readerToString(e.request.body)
        body = JSON.parse(rawBody)
        headers = {
          'x-api-key': e.request.header.get('x-api-key') || e.request.header.get('X-Api-Key'),
          x_api_key: e.request.header.get('x_api_key') || e.request.header.get('X_Api_Key'),
        }
      } catch (errFallback) {
        return e.json(400, { message: 'Nao foi possivel ler o body da requisicao' })
      }
    }

    if (!body) {
      return e.json(400, { message: 'Nao foi possivel ler o body da requisicao' })
    }

    const expectedKey = $secrets.get('WORKSPACE_BRIDGE_KEY') || 'WORKSPACE_BRIDGE_KEY_2026'
    const providedKey = headers['x-api-key'] || headers['x_api_key']

    if (providedKey !== expectedKey) {
      return e.json(401, { message: 'Nao autorizado' })
    }

    if (!body.contrato_id || !body.tipo_peticao || !body.conteudo_gerado) {
      return e.json(400, {
        message: 'Campos obrigatorios ausentes: contrato_id, tipo_peticao, conteudo_gerado',
      })
    }

    let contrato
    try {
      contrato = $app.findRecordById('contratos_assinados', body.contrato_id)
    } catch (err) {
      return e.json(404, { message: 'Contrato nao encontrado' })
    }

    $app.runInTransaction(function (txApp) {
      const peticoesCol = txApp.findCollectionByNameOrId('peticoes')
      const peticao = new Record(peticoesCol)

      peticao.set('contrato', body.contrato_id)
      peticao.set('tipo_peticao', body.tipo_peticao)
      peticao.set('conteudo_gerado', body.conteudo_gerado)
      peticao.set('status', 'rascunho')

      if (body.modelo) {
        peticao.set('modelo', body.modelo)
      } else if (body.modelo_id) {
        peticao.set('modelo', body.modelo_id)
      }

      if (body.dados_extraidos) {
        peticao.set('dados_extraidos', body.dados_extraidos)
      }

      txApp.save(peticao)

      contrato.set('status', 'processado')
      txApp.save(contrato)

      e.set('new_id', peticao.id)
    })

    return e.json(200, { id: e.get('new_id') })
  } catch (err) {
    console.log('salvar-peticao error:', err)
    return e.json(500, { message: 'Erro ao salvar peticao', detail: err.message || 'unknown' })
  }
})
