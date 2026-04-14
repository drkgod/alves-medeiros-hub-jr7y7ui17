routerAdd('GET', '/backend/v1/google-auth', (e) => {
  const userId = e.request.url.query().get('user_id')
  if (!userId) {
    return e.badRequestError('user_id parameter is required.')
  }

  const CLIENT_ID = '785736878856-mfjn2mv3nsgiik16tmlrnqt3mv3tvali.apps.googleusercontent.com'
  // Enforcing Skip Cloud architecture standards for custom route prefixes
  const REDIRECT_URI = 'https://alves-medeiros-hub-6074d.goskip.app/backend/v1/google-callback'

  const scope = encodeURIComponent('https://www.googleapis.com/auth/drive')
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${userId}`

  return e.redirect(302, authUrl)
})
