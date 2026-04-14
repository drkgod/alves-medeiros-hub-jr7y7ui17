routerAdd('GET', '/backend/v1/google-callback', (e) => {
  const code = e.request.url.query().get('code')
  const userId = e.request.url.query().get('state')

  if (!code || !userId) {
    return e.html(
      400,
      "<html><body><h1>Erro: code ou state (user_id) ausente.</h1><button onclick='window.close()'>Fechar</button></body></html>",
    )
  }

  const CLIENT_ID = '785736878856-mfjn2mv3nsgiik16tmlrnqt3mv3tvali.apps.googleusercontent.com'
  const CLIENT_SECRET = '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'
  const REDIRECT_URI = 'https://alves-medeiros-hub-6074d.goskip.app/backend/v1/google-callback'

  try {
    const res = $http.send({
      url: 'https://oauth2.googleapis.com/token',
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `code=${encodeURIComponent(code)}&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&grant_type=authorization_code`,
      timeout: 15,
    })

    if (res.statusCode !== 200) {
      console.log('Google Token Error:', res.json)
      return e.html(
        400,
        "<html><body><h1>Erro ao obter tokens do Google.</h1><p>Verifique o console para mais detalhes.</p><button onclick='window.close()'>Fechar</button></body></html>",
      )
    }

    const data = res.json
    const accessToken = data.access_token
    const refreshToken = data.refresh_token || ''
    const expiresIn = data.expires_in || 3599
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    // Upsert token in google_tokens
    let tokenRecord
    try {
      tokenRecord = $app.findFirstRecordByData('google_tokens', 'user', userId)
    } catch (err) {
      const col = $app.findCollectionByNameOrId('google_tokens')
      tokenRecord = new Record(col)
      tokenRecord.set('user', userId)
    }

    tokenRecord.set('access_token', accessToken)
    if (refreshToken) {
      tokenRecord.set('refresh_token', refreshToken)
    }

    // PocketBase expects date string format: YYYY-MM-DD HH:mm:ss.SSSZ
    const dbDateString = expiresAt.toISOString().replace('T', ' ')
    tokenRecord.set('expires_at', dbDateString)
    $app.save(tokenRecord)

    // Update configuracoes_usuario google_connected = true
    try {
      let configRecord = $app.findFirstRecordByData('configuracoes_usuario', 'user', userId)
      configRecord.set('google_connected', true)
      $app.save(configRecord)
    } catch (err) {
      const configCol = $app.findCollectionByNameOrId('configuracoes_usuario')
      let configRecord = new Record(configCol)
      configRecord.set('user', userId)
      configRecord.set('google_connected', true)
      $app.save(configRecord)
    }

    return e.html(
      200,
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Google Conectado</title>
          <style>
            body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0fdf4; color: #166534; }
            .card { text-align: center; padding: 2.5rem; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .icon { font-size: 64px; margin-bottom: 1rem; }
            h2 { margin: 0 0 0.5rem 0; font-size: 1.5rem; }
            p { margin: 0; color: #4b5563; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon">✅</div>
            <h2>Conta Google conectada com sucesso!</h2>
            <p>Você já pode fechar esta janela.</p>
            <script>
              setTimeout(() => {
                if (window.opener) {
                  window.opener.postMessage("google_connected", "*");
                }
                window.close();
              }, 2500);
            </script>
          </div>
        </body>
      </html>
    `,
    )
  } catch (err) {
    console.log('Google callback error', err)
    return e.html(
      500,
      "<html><body><h1>Erro interno no servidor ao processar o callback do Google.</h1><button onclick='window.close()'>Fechar</button></body></html>",
    )
  }
})
