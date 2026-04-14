migrate(
  (app) => {
    const usersId = '_pb_users_auth_'

    const contratos = new Collection({
      name: 'contratos_assinados',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'zapsign_token', type: 'text', required: true },
        { name: 'nome_signatario', type: 'text', required: true },
        { name: 'cpf', type: 'text', required: true },
        { name: 'email', type: 'text' },
        { name: 'telefone', type: 'text' },
        { name: 'url_pdf', type: 'text' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['pendente_processamento', 'processado', 'erro'],
          maxSelect: 1,
        },
        { name: 'dados_webhook', type: 'json' },
        { name: 'data_assinatura', type: 'date' },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_contratos_zapsign ON contratos_assinados (zapsign_token)'],
    })
    app.save(contratos)

    const modelos = new Collection({
      name: 'modelos_peticao',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'tipo', type: 'text', required: true },
        { name: 'titulo', type: 'text', required: true },
        { name: 'corpo_template', type: 'editor', required: true },
        { name: 'campos_obrigatorios', type: 'json', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
      indexes: ['CREATE UNIQUE INDEX idx_modelos_tipo ON modelos_peticao (tipo)'],
    })
    app.save(modelos)

    const peticoes = new Collection({
      name: 'peticoes',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'tipo_peticao', type: 'text', required: true },
        { name: 'conteudo_gerado', type: 'editor' },
        { name: 'dados_extraidos', type: 'json' },
        {
          name: 'status',
          type: 'select',
          required: true,
          values: ['rascunho', 'revisado', 'finalizado', 'protocolado'],
          maxSelect: 1,
        },
        { name: 'advogado_responsavel', type: 'text' },
        {
          name: 'contrato',
          type: 'relation',
          required: true,
          collectionId: contratos.id,
          maxSelect: 1,
        },
        { name: 'modelo', type: 'relation', collectionId: modelos.id, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(peticoes)

    const diagnosticos = new Collection({
      name: 'diagnosticos_prefeitura',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        { name: 'municipio', type: 'text', required: true },
        { name: 'estado', type: 'text', required: true },
        { name: 'respostas', type: 'json', required: true },
        { name: 'scores', type: 'json', required: true },
        { name: 'score_geral', type: 'number', required: true },
        { name: 'pontos_criticos', type: 'json' },
        { name: 'recomendacoes', type: 'json' },
        { name: 'user', type: 'relation', required: true, collectionId: usersId, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(diagnosticos)

    const video_aulas = new Collection({
      name: 'video_aulas',
      type: 'base',
      listRule: "@request.auth.id != ''",
      viewRule: "@request.auth.id != ''",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != ''",
      deleteRule: "@request.auth.id != ''",
      fields: [
        { name: 'modulo', type: 'text', required: true },
        { name: 'titulo', type: 'text', required: true },
        { name: 'url_video', type: 'url', required: true },
        { name: 'duracao_minutos', type: 'number', required: true },
        { name: 'ordem', type: 'number', required: true },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(video_aulas)

    const progresso_video = new Collection({
      name: 'progresso_video',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        { name: 'assistido', type: 'bool' },
        { name: 'progresso_percentual', type: 'number' },
        {
          name: 'video',
          type: 'relation',
          required: true,
          collectionId: video_aulas.id,
          maxSelect: 1,
        },
        { name: 'user', type: 'relation', required: true, collectionId: usersId, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(progresso_video)

    const google_tokens = new Collection({
      name: 'google_tokens',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        { name: 'access_token', type: 'text', required: true },
        { name: 'refresh_token', type: 'text', required: true },
        { name: 'expires_at', type: 'date', required: true },
        { name: 'user', type: 'relation', required: true, collectionId: usersId, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(google_tokens)

    const config_user = new Collection({
      name: 'configuracoes_usuario',
      type: 'base',
      listRule: "@request.auth.id != '' && user = @request.auth.id",
      viewRule: "@request.auth.id != '' && user = @request.auth.id",
      createRule: "@request.auth.id != ''",
      updateRule: "@request.auth.id != '' && user = @request.auth.id",
      deleteRule: "@request.auth.id != '' && user = @request.auth.id",
      fields: [
        { name: 'advbox_token', type: 'text' },
        { name: 'google_connected', type: 'bool' },
        { name: 'preferencias', type: 'json' },
        { name: 'user', type: 'relation', required: true, collectionId: usersId, maxSelect: 1 },
        { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
        { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
      ],
    })
    app.save(config_user)
  },
  (app) => {
    const collections = [
      'configuracoes_usuario',
      'google_tokens',
      'progresso_video',
      'video_aulas',
      'diagnosticos_prefeitura',
      'peticoes',
      'modelos_peticao',
      'contratos_assinados',
    ]
    for (const name of collections) {
      try {
        const col = app.findCollectionByNameOrId(name)
        app.delete(col)
      } catch (_) {}
    }
  },
)
