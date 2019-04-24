/**
 * @module propagateNamespace
 **/

const jp = require('jsonpath')
const {deepClone} = require('@ministryofjustice/fb-utils-node')

/**
 * Propagate namespace information through nested instances
 *
 * @param {object} instances
 *  Object of service instances keyed by id
 *
 * @param {object} schemas
 *  Object of service schemas keyed by _name
 *
 * @return {object}
 *  Cloned object containing instances with propagated namespaces
 **/
const propagate = (instances, schemas) => {
  instances = deepClone(instances)

  Object.keys(schemas).forEach(type => {
    const categoryTypes = schemas[type].category
    if (categoryTypes) {
      const categoryInstances = jp.query(instances, `$..[?(@._type === "${type}")]`)
      categoryInstances.forEach(categoryInstance => {
        categoryTypes.forEach(categoryType => {
          // TODO: Is ${categoryType} the best idea?
          categoryInstance[`$${categoryType}`] = true
        })
      })
    }
  })

  return instances
}
module.exports = {
  propagate
}
