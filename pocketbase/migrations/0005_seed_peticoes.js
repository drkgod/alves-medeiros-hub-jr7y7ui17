migrate((app) => {
  const modelosCollection = app.findCollectionByNameOrId('modelos_peticao')

  let model1Id
  try {
    model1Id = app.findFirstRecordByData('modelos_peticao', 'tipo', 'ferias_professor').id
  } catch (_) {
    const m1 = new Record(modelosCollection)
    m1.set('tipo', 'ferias_professor')
    m1.set('titulo', 'Petição Inicial - Férias de Professor')
    m1.set('corpo_template', '<p>AÇÃO ORDINÁRIA DE COBRANÇA DE FÉRIAS NÃO GOZADAS...</p>')
    m1.set('campos_obrigatorios', ['nome', 'cpf', 'endereco', 'data_admissao', 'cargo'])
    app.save(m1)
    model1Id = m1.id
  }

  let model2Id
  try {
    model2Id = app.findFirstRecordByData('modelos_peticao', 'tipo', 'progressao_funcional').id
  } catch (_) {
    const m2 = new Record(modelosCollection)
    m2.set('tipo', 'progressao_funcional')
    m2.set('titulo', 'Petição Inicial - Progressão Funcional')
    m2.set('corpo_template', '<p>AÇÃO DE PROGRESSÃO FUNCIONAL...</p>')
    m2.set('campos_obrigatorios', [
      'nome',
      'cpf',
      'cargo',
      'nivel_atual',
      'nivel_pretendido',
      'data_admissao',
    ])
    app.save(m2)
    model2Id = m2.id
  }

  const contratosCollection = app.findCollectionByNameOrId('contratos_assinados')
  let contractId
  try {
    contractId = app.findFirstRecordByData(
      'contratos_assinados',
      'nome_signatario',
      'Carlos Eduardo Mendes',
    ).id
  } catch (_) {
    const contract = new Record(contratosCollection)
    contract.set('zapsign_token', 'dummy_token_peticoes_' + $security.randomString(6))
    contract.set('nome_signatario', 'Carlos Eduardo Mendes')
    contract.set('cpf', '98765432100')
    contract.set('email', 'carlos@example.com')
    contract.set('status', 'processado')
    app.save(contract)
    contractId = contract.id
  }

  const peticoesCollection = app.findCollectionByNameOrId('peticoes')
  try {
    app.findFirstRecordByData('peticoes', 'contrato', contractId)
  } catch (_) {
    const peticao = new Record(peticoesCollection)
    peticao.set('tipo_peticao', 'ferias_professor')
    peticao.set(
      'conteudo_gerado',
      '<p>EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO...</p><p>Nome: Carlos Eduardo Mendes</p>',
    )
    peticao.set('dados_extraidos', {
      nome: 'Carlos Eduardo Mendes',
      cpf: '98765432100',
      endereco: 'Rua das Flores 123 Natal RN',
      data_admissao: '15/03/2010',
      cargo: 'Professor',
    })
    peticao.set('status', 'rascunho')
    peticao.set('contrato', contractId)
    peticao.set('modelo', model1Id)
    app.save(peticao)
  }
})
