const test = require('tape')
const path = require('path')

const {FBLogger} = require('@ministryofjustice/fb-utils-node')

const {merge} = require('./jsonmerger')

const pathLoaded = path.resolve('data', 'loaded', 'loaded.json')
const loadedData = require(pathLoaded)

test('When loading the json', function (t) {
  // FBLogger.verbose(true)
  FBLogger(merge(loadedData))
  t.end()
})
