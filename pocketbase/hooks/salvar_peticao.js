routerAdd('POST', '/backend/v1/hooks/salvar-peticao', (e) => {
  const apiKey = e.request.header.get('x-api-key') || e.requestInfo().headers['x_api_key']
  if (apiKey !== 'WORKSPACE_BRIDGE_KEY_2026') {
    throw new UnauthorizedError('Nao autorizado')
  }

  const body = e.requestInfo().body || {}
  if (!body.contrato_id || !body.tipo_peticao || !body.conteudo_gerado) {
    throw new BadRequestError('Dados inválidos')
  }

  let contrato
  try {
    contrato = $app.findRecordById('contratos_assinados', body.contrato_id)
  } catch (err) {
    throw new NotFoundError('Contrato não encontrado')
  }

  try {
    $app.runInTransaction((txApp) => {
      const peticoesCol = txApp.findCollectionByNameOrId('peticoes')
      const peticao = new Record(peticoesCol)
      peticao.set('contrato', body.contrato_id)
      peticao.set('tipo_peticao', body.tipo_peticao)
      peticao.set('conteudo_gerado', body.conteudo_gerado)
      peticao.set('status', 'rascunho')
      if (body.modelo_id) {
        peticao.set('modelo', body.modelo_id)
      }
      txApp.save(peticao)

      contrato.set('status', 'processado')
      txApp.save(contrato)

      e.set('new_id', peticao.id)
    })

    return e.json(200, { id: e.get('new_id') })
  } catch (err) {
    throw new InternalServerError('Erro ao salvar petição')
  }
})
