/**
 * @module propagateSteps
 **/

const jp = require('jsonpath')
const {deepClone, FBError} = require('@ministryofjustice/fb-utils-node')

class FBPageParentError extends FBError { }

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

const propagateSteps = (instances) => {
  instances = deepClone(instances)
  const instancesWithParents = addPageParents(instances)
  return instancesWithParents
}

module.exports = {
  propagateSteps
}
