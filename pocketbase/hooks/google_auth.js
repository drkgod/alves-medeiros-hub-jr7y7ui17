routerAdd('GET', '/backend/v1/google-auth', (e) => {
  const userId = e.request.url.query().get('user_id')
  if (!userId) {
    return e.badRequestError('user_id parameter is required.')
  }

  const CLIENT_ID = $secrets.get('CLIENT_ID')
  const REDIRECT_URI = $secrets.get('REDIRECT_URI')

  const scope = encodeURIComponent('https://www.googleapis.com/auth/drive')
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${userId}`

  return e.redirect(302, authUrl)
})
