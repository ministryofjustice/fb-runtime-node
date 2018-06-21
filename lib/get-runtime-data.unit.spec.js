const test = require('tape')
const path = require('path')

const {getRuntimeData} = require('./get-runtime-data')

const metadata = path.resolve('data', 'runtime', 'metadata')
const source1 = {
  source: 'source1',
  path: metadata
}

const getTestData = name => {
  const dataPath = path.resolve('data', `${name}.json`)
  return require(dataPath)
}

test('When propagating the show properties', function (t) {
  t.plan(1)

  const sourceObjs = [source1]
  const schemas = getTestData('model/schemas')
  const expected = getTestData('runtime/expected-a')
  getRuntimeData(sourceObjs, schemas)
    .then(instances => {
      t.deepEqual(instances, expected, 'it should do so correctly')
    })
})
