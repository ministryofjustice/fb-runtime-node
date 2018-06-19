/**
 * @module loadSchemas
 **/

const glob = require('glob-promise')
const path = require('path')

const schemaUtils = require('@ministryofjustice/fb-specification/lib/schema-utils')

const load = (specName) => {
  const specPath = path.resolve(`node_modules/${specName}`)
  const {expandSchema} = schemaUtils(specPath)
  const specSchemas = `${specPath}/specifications/**/*.schema.json`
  const schemaPaths = glob.sync(specSchemas)

  const schemas = {}
  const loadSchema = schemaPath => {
    const schema = require(schemaPath)
    return expandSchema(schema._name, {path: specPath})
      .then(loadedSchema => {
        schemas[loadedSchema._name] = loadedSchema
      })
  }
  return Promise.all(schemaPaths.map(loadSchema))
}

module.exports = {
  load
}
