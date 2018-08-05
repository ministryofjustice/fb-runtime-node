/**
 * @module propagateSteps
 **/

const jp = require('jsonpath')
const {deepClone, FBError} = require('@ministryofjustice/fb-utils-node')

class FBPageParentError extends FBError { }
class FBPageRepeatableModelError extends FBError { }

/**
 * Add parent ref to all page instances
 *
 * @param {object} instances
 *  Object containing all instances keyed by _id
 *
 * @return {object}
 *  Updated clone of original instances
 **/
const addPageParents = instances => {
  instances = deepClone(instances)

  jp.query(instances, '$..[?(@.steps)]').forEach(instance => {
    instance.steps.forEach(step => {
      if (instances[step]._parent) {
        throw new FBPageParentError(`${step} already has _parent property`, {
          data: {
            step,
            instances
          }
        })
      }
      instances[step]._parent = instance._id
    })
  })

  return instances
}

/**
 * Recursively propagate stepsHeading to instance steps
 *
 * @param {object} instances
 *  Object containing all instances keyed by _id
 *
 * @param {object} instance
 *  Instance object
 *
 * @return {undefined}
 *  Updating of instances is achieved by setting properties directly on uncloned instances
 **/
const propagateStepsHeading = (instances, instance) => {
  if (instance.steps) {
    instance.steps.forEach(step => {
      const stepInstance = instances[step]
      if (stepInstance.sectionHeading === undefined) {
        stepInstance.sectionHeading = instance.stepsHeading
      }
    })
  }
}

/**
 * Recursively propagate sectionHeading to instance steps
 *
 * @param {object} instances
 *  Object containing all instances keyed by _id
 *
 * @param {object} instance
 *  Instance object
 *
 * @return {undefined}
 *  Updating of instances is achieved by setting properties directly on uncloned instances
 **/
const propagateSectionHeading = (instances, instance) => {
  if (instance.steps) {
    instance.steps.forEach(step => {
      const stepInstance = instances[step]
      if (stepInstance.sectionHeading === undefined) {
        stepInstance.sectionHeading = instance.sectionHeading
      }
      propagateSectionHeading(instances, stepInstance)
    })
  }
}

/**
 * Recursively propagate model to instance steps
 *
 * @param {object} instances
 *  Object containing all instances keyed by _id
 *
 * @param {object} instance
 *  Instance object
 *
 * @return {undefined}
 *  Updating of instances is achieved by setting properties directly on uncloned instances
 **/
const propagateModels = (instances, instance) => {
  if (instance._parent) {
    return
  }
  if (!instance.model) {
    return
  }
  const recursePropagation = (instance) => {
    instance.$models = instance.$models || []
    const parent = instances[instance._parent]
    if (parent) {
      if (!instance.modelProtect) {
        instance.$models = deepClone(parent.$models)
      }
    }
    if (instance.model) {
      instance.$models.push(instance.model)
    }
    let namePrefix
    instance.$models.forEach((model, index) => {
      namePrefix = index ? namePrefix : ''
      namePrefix += index ? `[${model}]` : model
    })
    instance.namePrefix = namePrefix
    if (instance.steps) {
      instance.steps.forEach(step => {
        const stepInstance = instances[step]
        recursePropagation(stepInstance)
      })
    }
  }
  recursePropagation(instance)
}

/**
 * Recursively propagate model to instance steps
 *
 * @param {object} instances
 *  Object containing all instances keyed by _id
 *
 * @param {object} instance
 *  Instance object
 *
 * @return {undefined}
 *  Updating of instances is achieved by setting properties directly on uncloned instances
 **/
const propagateUrls = (instances, instance) => {
  const serviceRoot = '/'
  if (!instance.url) {
    instance.url = `${serviceRoot}${instance._id}`
  }
  if (instance.repeatable) {
    if (!instance.model) {
      throw new FBPageRepeatableModelError(`${instance._id} is repeatable but has no model`, {
        data: {
          _id: instance._id,
          instances
        }
      })
    }
    const modelParam = `/:${instance.model}`
    if (!instance.url.endsWith(modelParam)) {
      instance.url += modelParam
    }
  }
  if (instance.url.startsWith('/')) {
    return
  }
  if (!instance._parent) {
    instance.url = `${serviceRoot}${instance.url}`
  } else {
    const parentInstance = instances[instance._parent]
    propagateUrls(instances, parentInstance)
    instance.url = `${parentInstance.url}/${instance.url}`
  }
}

/**
 * Propagate steps information through nested instances
 *
 * @param {object} instances
 *  Object of service instances keyed by id
 *
 * @return {object}
 *  Cloned object containing instances with propagated step info
 **/
const propagate = (instances) => {
  instances = deepClone(instances)
  const instancesWithParents = addPageParents(instances)

  jp.query(instancesWithParents, '$..[?(@.stepsHeading)]').forEach(instance => {
    propagateStepsHeading(instancesWithParents, instance)
  })

  jp.query(instancesWithParents, '$..[?(@.sectionHeading)]').forEach(instance => {
    propagateSectionHeading(instancesWithParents, instance)
  })

  jp.query(instancesWithParents, '$..[?(@._type && @._type.startsWith("page."))]').forEach(instance => {
    propagateModels(instancesWithParents, instance)
    propagateUrls(instancesWithParents, instance)
  })

  return instancesWithParents
}

module.exports = {
  propagate
}
