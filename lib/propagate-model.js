/**
 * @module propagateModel
 **/

const jp = require('jsonpath')
const {deepClone} = require('@ministryofjustice/fb-utils-node')

const categories = {
  text: ['$control'],
  radios: ['$control'],
  group: ['$grouping']
}

// TODO: Instructions should be passed through (and derived from specifications)
const instructions = {
  'page.wham': 'components[?(@.$control || @.$grouping)]',
  group: 'items[?(@.$control || @.$grouping)]'
}
// [?(@.$control || @.$grouping)]

/**
 * Propagate model information of a specific instance
 *
 * @param {object} instance
 *  Instance object
 *
 * @param {string} namePrefix
 *  Any namePrefix of any instance higher in the hierarchy
 *
 * @return {undefined}
 *  Updating of instances is achieved by setting properties directly on uncloned instances
 **/
const propagateInstance = (instance, namePrefix) => {
  if (instance.model && !instance.namePrefix) {
    instance.namePrefix = instance.model
  }
  if (instance.modelProtect || instance.$modelUpdated) {
    return
  }
  if (namePrefix) {
    // instance.model = namePrefix + (instance.model ? `.${instance.model}` : '')
    instance.namePrefix = namePrefix + (instance.namePrefix ? `.${instance.namePrefix}` : '')
  }
  const typeInstructions = instructions[instance._type]
  if (typeInstructions) {
    const subInstances = jp.query(instance, `$.${typeInstructions}`)
    subInstances.forEach(subInstance => {
      propagateInstance(subInstance, instance.namePrefix)
    })
  }
  instance.$modelUpdated = true
}

/**
 * Propagate model information through nested instances
 *
 * @param {object} instances
 *  Object of service instances keyed by id
 *
 * @return {object}
 *  Cloned object containing instances with propagated models
 **/
const propagate = instances => {
  instances = deepClone(instances)

  Object.keys(categories).forEach(type => {
    const categoryTypes = categories[type]
    const categoryInstances = jp.query(instances, `$..[?(@._type === "${type}")]`)
    categoryInstances.forEach(categoryInstance => {
      categoryTypes.forEach(categoryType => {
        categoryInstance[categoryType] = true
      })
    })
  })

  jp.query(instances, '$..[?(@.model)]').forEach(instance => {
    propagateInstance(instance)
  })

  // remove temporary $modelUpdated properties
  jp.query(instances, '$..[?(@.$modelUpdated)]').forEach(modelUpdatedInstance => {
    delete modelUpdatedInstance.$modelUpdated
  })

  return instances
}
module.exports = {
  propagate
}
