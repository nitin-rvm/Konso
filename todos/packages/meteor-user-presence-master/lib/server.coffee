connections = {}

idleDelay = 10000
tickDelay = 5000
onDisconnect = null

UserPresenceSettings = (params={}) ->
  idleDelay = params.idleDelay or idleDelay
  tickDelay = params.tickDelay or tickDelay
  onDisconnect = params.onDisconnect

expire = (id) ->
  onDisconnect?(UserPresences.findOne id)
  p = UserPresences.findOne(id)
  if p.userId
    Meteor.users.update {_id: p.userId}, {$set: {"profile.presence": UserPresence.offline}}
  UserPresences.remove id
  delete connections[id]

idle = (id) ->
  UserPresences.update id, $set: state:"idle"
  p = UserPresences.findOne id
  if p.userId
    Meteor.users.update {_id: p.userId}, {$set: {"profile.presence": UserPresence.idle}}


tick = (id) ->
  connections[id].lastSeen = Date.now()

Meteor.startup ->
  UserPresences.remove({})
  Meteor.users.update {}, {$set: {"profile.presence": UserPresence.offline}}, {multi: true}


Meteor.onConnection (connection) ->
  UserPresences.insert _id:connection.id
  connections[connection.id] = {}
  tick connection.id

  connection.onClose -> expire connection.id

Meteor.methods
  userPresenceTick: ->
    check arguments, [Match.Any]
    if @.connection and connections[@.connection.id]
      tick @.connection.id

Meteor.setInterval ->
  _.each connections, (connection, id) ->
    if connection and connection.lastSeen < (Date.now() - idleDelay)
      idle id
, tickDelay
