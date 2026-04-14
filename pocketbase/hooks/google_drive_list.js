routerAdd(
  'POST',
  '/backend/v1/google-drive-list',
  (e) => {
    const body = e.requestInfo().body || {}
    const parentId = body.parent_id || 'root'
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

    // List files query
    const queryParams = new URLSearchParams({
      q: `'${parentId}' in parents and trashed = false`,
      fields: 'files(id, name, mimeType, size, webViewLink, iconLink)',
      orderBy: 'folder,name',
      pageSize: '100',
    })

    const driveRes = $http.send({
      url: 'https://www.googleapis.com/drive/v3/files?' + queryParams.toString(),
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}` },
    })

    if (driveRes.statusCode !== 200) {
      return e.json(driveRes.statusCode, { error: driveRes.json })
    }

    const files = (driveRes.json.files || []).map((f) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      size: f.size,
      webViewLink: f.webViewLink,
      iconLink: f.iconLink,
      isFolder: f.mimeType === 'application/vnd.google-apps.folder',
    }))

    return e.json(200, { files })
  },
  $apis.requireAuth(),
)
