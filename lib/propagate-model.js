/**
 * @module propagateModel
 **/

const jp = require('jsonpath')
const {deepClone} = require('@ministryofjustice/fb-utils-node')

/**
 * Propagate model information of a specific instance
 *
 * @param {object} instance
 *  Instance object
 *
 * @param {object} schemas
 *  Object of service schemas keyed by _name
 *
 * @param {string} namePrefix
 *  Any namePrefix of any instance higher in the hierarchy
 *
 * @param {string} $models
 *  Any models of any instance higher in the hierarchy
 *
 * @return {undefined}
 *  Updating of instances is achieved by setting properties directly on uncloned instances
 **/
const propagateInstance = (instance, schemas, namePrefix, $models) => {
  if (instance.$modelUpdated) {
    return
  }
  if (!instance.$models) {
    instance.$models = $models ? $models.slice() : []
  }
  if (instance.modelProtect) {
    instance.$models = []
  }
  if (instance.model && !instance.namePrefix) {
    instance.namePrefix = instance.model
    instance.$models.push(instance.model)
  }
  if (instance.modelProtect) {
    instance.$modelUpdated = true
    return
  }
  if (namePrefix) {
    const decorateNamePrefix = (str) => {
      if (str) {
        str = `[${str}]`
        str = str.replace(/\[(\d+)\]\]/, '][$1]')
      }
      return str
    }
    if (instance.namePrefix) {
      instance.namePrefix = decorateNamePrefix(instance.namePrefix)
    }
    instance.namePrefix = namePrefix + (instance.namePrefix ? `${instance.namePrefix}` : '')
    if (instance.name) {
      instance.name = decorateNamePrefix(instance.name)
      instance.name = `${instance.namePrefix}${instance.name}`
    }
  }

  const typeSchema = schemas[instance._type]
  const typeInstructions = jp.value(typeSchema, '$.transforms.model.propagation')
  if (typeInstructions) {
    // TODO: Is ${categoryType} the best idea?
    const subInstances = jp.query(instance, `$.${typeInstructions}`)
    subInstances.forEach(subInstance => {
      propagateInstance(subInstance, schemas, instance.namePrefix, instance.$models)
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
 * @param {object} schemas
 *  Object of service schemas keyed by _name
 *
 * @return {object}
 *  Cloned object containing instances with propagated models
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

  jp.query(instances, '$..[?(@.model)]').forEach(instance => {
    propagateInstance(instance, schemas)
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
