migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')

    try {
      app.findAuthRecordByEmail('_pb_users_auth_', 'rodrigo@adapta.org')
      return // already seeded
    } catch (_) {}

    const record = new Record(users)
    record.setEmail('rodrigo@adapta.org')
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Rodrigo Alves Medeiros')
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'rodrigo@adapta.org')
      app.delete(record)
    } catch (_) {}
  },
)
