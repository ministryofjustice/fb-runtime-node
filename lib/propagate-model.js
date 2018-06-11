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

const instructions = {
  'page.wham': 'components[?(@.$control || @.$grouping)]',
  group: 'items[?(@.$control || @.$grouping)]'
}
// [?(@.$control || @.$grouping)]

const propagateInstance = (instance, model) => {
  if (instance.modelProtect || instance.$modelUpdated) {
    return
  }
  if (model) {
    instance.model = model + (instance.model ? `.${instance.model}` : '')
  }
  const typeInstructions = instructions[instance._type]
  if (typeInstructions) {
    const subInstances = jp.query(instance, `$.${typeInstructions}`)
    subInstances.forEach(subInstance => {
      propagateInstance(subInstance, instance.model)
    })
  }
  instance.$modelUpdated = true
}

// /**
//  * Load json files from multiple locations
//  * @async
//  * @param {array.<{source: string, path: string}>} sources
//  *  Array of objects specifying
//  *  - path to load json from
//  *  - source as key return loaded data against
//  * @return {Promise.<array.<{source: string, data: array}>>}
//  *  Promised array of loaded json
//  **/
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

  jp.query(instances, '$..[?(@.$modelUpdated)]').forEach(modelUpdatedInstance => {
    delete modelUpdatedInstance.$modelUpdated
  })

  return instances
}
module.exports = {
  propagate
}
