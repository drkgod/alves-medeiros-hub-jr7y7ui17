migrate(
  (app) => {
    const col = app.findCollectionByNameOrId('video_aulas')

    const seed = [
      {
        modulo: 'Gestao Fiscal',
        titulo: 'Introducao ao Orcamento Publico',
        url_video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duracao_minutos: 15,
        ordem: 1,
      },
      {
        modulo: 'Gestao Fiscal',
        titulo: 'Transparencia e Portal de Dados',
        url_video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duracao_minutos: 12,
        ordem: 2,
      },
      {
        modulo: 'Licitacoes',
        titulo: 'Nova Lei de Licitacoes (14.133/21)',
        url_video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duracao_minutos: 20,
        ordem: 1,
      },
      {
        modulo: 'Licitacoes',
        titulo: 'Pregao Eletronico na Pratica',
        url_video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duracao_minutos: 18,
        ordem: 2,
      },
      {
        modulo: 'Legislacao Municipal',
        titulo: 'Lei Organica do Municipio',
        url_video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duracao_minutos: 14,
        ordem: 1,
      },
      {
        modulo: 'Legislacao Municipal',
        titulo: 'Estatuto do Servidor Publico',
        url_video: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        duracao_minutos: 16,
        ordem: 2,
      },
    ]

    for (const item of seed) {
      try {
        app.findFirstRecordByData('video_aulas', 'titulo', item.titulo)
      } catch (_) {
        const record = new Record(col)
        record.set('modulo', item.modulo)
        record.set('titulo', item.titulo)
        record.set('url_video', item.url_video)
        record.set('duracao_minutos', item.duracao_minutos)
        record.set('ordem', item.ordem)
        app.save(record)
      }
    }
  },
  (app) => {
    const records = app.findRecordsByFilter(
      'video_aulas',
      "url_video = 'https://www.youtube.com/embed/dQw4w9WgXcQ'",
      '-created',
      100,
      0,
    )
    for (const record of records) {
      app.delete(record)
    }
  },
)
