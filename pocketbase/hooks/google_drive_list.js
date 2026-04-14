routerAdd(
  'POST',
  '/backend/v1/google-drive-list',
  (e) => {
    try {
      const info = e.requestInfo()
      const body = info.body || {}
      const parentId = body.parent_id || 'root'
      const authUser = e.auth

      if (!authUser) {
        return e.json(401, { message: 'Autenticacao necessaria.' })
      }

      const userId = authUser.id
      const CLIENT_ID = $secrets.get('CLIENT_ID')
      const CLIENT_SECRET = $secrets.get('CLIENT_SECRET')

      let tokenRecord
      try {
        tokenRecord = $app.findFirstRecordByData('google_tokens', 'user', userId)
      } catch (err) {
        return e.json(401, { message: 'Por favor, conecte sua conta do Google Drive.' })
      }

      let accessToken = tokenRecord.get('access_token')
      let refreshToken = tokenRecord.get('refresh_token')
      let expiresAtStr = tokenRecord.get('expires_at')
      let expiresAt = new Date(expiresAtStr).getTime()

      if (Date.now() + 60000 > expiresAt) {
        if (!refreshToken) {
          return e.json(401, { message: 'Sessao Google expirada e sem refresh token.' })
        }

        const res = $http.send({
          url: 'https://oauth2.googleapis.com/token',
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${refreshToken}&grant_type=refresh_token`,
        })

        if (res.statusCode !== 200) {
          return e.json(401, { message: 'Falha ao renovar a sessao do Google.' })
        }

        const data = res.json
        accessToken = data.access_token
        tokenRecord.set('access_token', accessToken)
        if (data.refresh_token) {
          tokenRecord.set('refresh_token', data.refresh_token)
        }

        const newExpiresAt = new Date(Date.now() + (data.expires_in || 3599) * 1000)
        tokenRecord.set('expires_at', newExpiresAt.toISOString().replace('T', ' '))
        $app.save(tokenRecord)
      }

      const queryStr =
        'q=' +
        encodeURIComponent("'" + parentId + "' in parents and trashed = false") +
        '&fields=' +
        encodeURIComponent('files(id, name, mimeType, size, webViewLink, iconLink, modifiedTime)') +
        '&orderBy=' +
        encodeURIComponent('folder,name') +
        '&pageSize=100'

      const driveRes = $http.send({
        url: 'https://www.googleapis.com/drive/v3/files?' + queryStr,
        method: 'GET',
        headers: { Authorization: `Bearer ${accessToken}` },
      })

      if (driveRes.statusCode !== 200) {
        throw new Error(
          'Google Drive API returned status ' +
            driveRes.statusCode +
            ': ' +
            JSON.stringify(driveRes.json),
        )
      }

      const files = (driveRes.json.files || []).map((f) => ({
        id: f.id,
        name: f.name,
        mimeType: f.mimeType,
        size: f.size || '',
        webViewLink: f.webViewLink || '',
        iconLink: f.iconLink || '',
        modifiedTime: f.modifiedTime || '',
        isFolder: f.mimeType === 'application/vnd.google-apps.folder',
      }))

      return e.json(200, { files })
    } catch (err) {
      console.log('google-drive-list error:', err)
      return e.json(500, {
        message: 'Ocorreu um erro ao listar os arquivos do Google Drive.',
        detail: err.message || String(err),
      })
    }
  },
  $apis.requireAuth(),
)
