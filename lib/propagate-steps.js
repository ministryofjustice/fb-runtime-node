/**
 * @module propagateSteps
 **/

const jp = require('jsonpath')
const {deepClone, FBError} = require('@ministryofjustice/fb-utils-node')

class FBPageParentError extends FBError { }

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
 * Propagate steps information through nested instances
 *
 * @param {object} instances
 *  Object of service instances keyed by id
 *
 * @return {object}
 *  Cloned object containing instances with propagated step info
 **/
const propagateSteps = (instances) => {
  instances = deepClone(instances)
  const instancesWithParents = addPageParents(instances)

  jp.query(instancesWithParents, '$..[?(@.stepsHeading)]').forEach(instance => {
    propagateStepsHeading(instancesWithParents, instance)
  })

  jp.query(instancesWithParents, '$..[?(@.sectionHeading)]').forEach(instance => {
    propagateSectionHeading(instancesWithParents, instance)
  })

  return instancesWithParents
}

module.exports = {
  propagateSteps
}
