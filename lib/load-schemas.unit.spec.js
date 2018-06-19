const test = require('tape')
const path = require('path')
const {FBLogger} = require('@ministryofjustice/fb-utils-node')

const schemaUtils = require('@ministryofjustice/fb-specification/lib/schema-utils')

// const getTestData = name => {
//   const dataPath = path.resolve('data', 'show', `${name}.json`)
//   return require(dataPath)
// }

test('When propagating the show properties', function (t) {
  const {load} = schemaUtils(path.resolve(__dirname, '..', 'node_modules', '@ministryofjustice/fb-specification'))
  // const input = getTestData('input-a')
  // const expected = getTestData('expected-a')
  // const instances = load(input)
  load().then(schemas => {
    // FBLogger.verbose(true)
    FBLogger(path.resolve(__dirname, '..', 'node_modules', '@ministryofjustice/fb-specification'))
    FBLogger({schemas})
    t.end()
  })

  // t.deepEqual(instances, expected, 'it should do so correctly')
})
