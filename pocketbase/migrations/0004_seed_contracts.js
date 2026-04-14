migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('contratos_assinados')

    const now = new Date()
    const yesterday = new Date(now.getTime() - 86400000)
    const threeDaysAgo = new Date(now.getTime() - 3 * 86400000)

    const contracts = [
      {
        zapsign_token: 'test-token-001',
        nome_signatario: 'Ana Kaline Silva de Azevedo',
        cpf: '12345678901',
        email: 'ana.kaline@email.com',
        telefone: '84999991111',
        status: 'pendente_processamento',
        data_assinatura: now.toISOString(),
        url_pdf: 'https://example.com/pdf1.pdf',
      },
      {
        zapsign_token: 'test-token-002',
        nome_signatario: 'Carlos Eduardo Mendes',
        cpf: '98765432100',
        email: 'carlos.mendes@email.com',
        telefone: '84999992222',
        status: 'processado',
        data_assinatura: yesterday.toISOString(),
        url_pdf: 'https://example.com/pdf2.pdf',
      },
      {
        zapsign_token: 'test-token-003',
        nome_signatario: 'Maria das Graças Oliveira',
        cpf: '45678912300',
        email: 'maria.gracas@email.com',
        status: 'erro',
        data_assinatura: threeDaysAgo.toISOString(),
        url_pdf: 'https://example.com/pdf3.pdf',
      },
    ]

    for (const data of contracts) {
      try {
        app.findFirstRecordByData('contratos_assinados', 'zapsign_token', data.zapsign_token)
      } catch (_) {
        const record = new Record(col)
        record.set('zapsign_token', data.zapsign_token)
        record.set('nome_signatario', data.nome_signatario)
        record.set('cpf', data.cpf)
        if (data.email) record.set('email', data.email)
        if (data.telefone) record.set('telefone', data.telefone)
        record.set('status', data.status)
        record.set('data_assinatura', data.data_assinatura)
        if (data.url_pdf) record.set('url_pdf', data.url_pdf)
        app.save(record)
      }
    }
  },
  (app) => {
    const tokens = ['test-token-001', 'test-token-002', 'test-token-003']
    for (const t of tokens) {
      try {
        const record = app.findFirstRecordByData('contratos_assinados', 'zapsign_token', t)
        app.delete(record)
      } catch (_) {}
    }
  },
)
