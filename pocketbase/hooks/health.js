routerAdd('GET', '/backend/v1/hooks/health', (e) => {
  return e.json(200, {
    message: 'API Alves Medeiros Hub operacional',
    timestamp: new Date().toISOString(),
  })
})
