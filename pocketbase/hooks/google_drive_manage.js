routerAdd(
  'POST',
  '/backend/v1/google-drive-manage',
  (e) => {
    const body = e.requestInfo().body || {}
    const action = body.action
    const authUser = e.auth

    if (!authUser) {
      return e.unauthorizedError('Authentication required.')
    }

    const userId = authUser.id
    const CLIENT_ID = $secrets.get('CLIENT_ID')
    const CLIENT_SECRET = $secrets.get('CLIENT_SECRET')

    let tokenRecord
    try {
      tokenRecord = $app.findFirstRecordByData('google_tokens', 'user', userId)
    } catch (err) {
      throw new UnauthorizedError('Google Drive nao conectado')
    }

    let accessToken = tokenRecord.get('access_token')
    let refreshToken = tokenRecord.get('refresh_token')
    let expiresAtStr = tokenRecord.get('expires_at')
    let expiresAt = new Date(expiresAtStr).getTime()

    // Refresh token if expired or expiring within 1 minute
    if (Date.now() + 60000 > expiresAt) {
      if (!refreshToken) {
        throw new UnauthorizedError('Sessao Google expirada')
      }
      const res = $http.send({
        url: 'https://oauth2.googleapis.com/token',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${refreshToken}&grant_type=refresh_token`,
      })

      if (res.statusCode !== 200) {
        throw new UnauthorizedError('Sessao Google expirada')
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

    const sendRequest = (method, url, payload) => {
      return $http.send({
        url,
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: payload ? JSON.stringify(payload) : null,
      })
    }

    try {
      if (action === 'create_folder') {
        const parentId = body.parent_id || 'root'
        const name = body.name
        if (!name) return e.badRequestError('Missing folder name')

        const res = sendRequest('POST', 'https://www.googleapis.com/drive/v3/files', {
          name,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        })

        return e.json(200, res.json)
      }

      if (action === 'rename') {
        const fileId = body.file_id
        const name = body.name
        if (!fileId || !name) return e.badRequestError('Missing file_id or name')

        const res = sendRequest('PATCH', `https://www.googleapis.com/drive/v3/files/${fileId}`, {
          name,
        })
        return e.json(200, res.json)
      }

      if (action === 'move') {
        const fileId = body.file_id
        const newParentId = body.new_parent_id
        const oldParentId = body.old_parent_id
        if (!fileId || !newParentId || !oldParentId)
          return e.badRequestError('Missing params for move')

        const res = $http.send({
          url: `https://www.googleapis.com/drive/v3/files/${fileId}?addParents=${newParentId}&removeParents=${oldParentId}`,
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        return e.json(200, res.json)
      }

      if (action === 'create_structure') {
        const clientName = body.client_name
        const parentId = body.parent_id || 'root'
        if (!clientName) return e.badRequestError('Missing client_name')

        // Create main folder
        const mainRes = sendRequest('POST', 'https://www.googleapis.com/drive/v3/files', {
          name: clientName,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [parentId],
        })

        if (mainRes.statusCode !== 200) return e.json(mainRes.statusCode, mainRes.json)

        const mainFolderId = mainRes.json.id
        const subfolders = ['01-Procuracao', '02-Documentos', '03-Peticoes', '04-Comprovantes']
        const results = []

        for (const sub of subfolders) {
          const subRes = sendRequest('POST', 'https://www.googleapis.com/drive/v3/files', {
            name: sub,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [mainFolderId],
          })
          results.push(subRes.json)
        }

        return e.json(200, { mainFolder: mainRes.json, subfolders: results })
      }

      return e.badRequestError('Invalid action specified')
    } catch (err) {
      return e.internalServerError('Error managing drive: ' + err.message)
    }
  },
  $apis.requireAuth(),
)
