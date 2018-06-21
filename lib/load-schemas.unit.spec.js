const test = require('tape')
const path = require('path')
const {FBLogger} = require('@ministryofjustice/fb-utils-node')

const schemaUtils = require('@ministryofjustice/fb-specification/lib/schema-utils')

test('When propagating the show properties', function (t) {
  const {load} = schemaUtils(path.resolve(__dirname, '..', 'node_modules', '@ministryofjustice/fb-specification'))
  load().then(schemas => {
    FBLogger(path.resolve(__dirname, '..', 'node_modules', '@ministryofjustice/fb-specification'))
    FBLogger({schemas})
    t.end()
  })
})
