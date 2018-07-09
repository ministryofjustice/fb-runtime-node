/**
 * @module getRuntimeData
 **/

const loadJSON = require('./load-json')
const mergeInstances = require('./merge-instances')
const propagateSteps = require('./propagate-steps')
const propagateModel = require('./propagate-model')
const propagateShow = require('./propagate-show')

const getRuntimeData = (sourceObjs, schemas) => {
  return loadJSON.load(sourceObjs)
    .then(sourceInstances => {
      const mergedInstances = mergeInstances.merge(sourceInstances)
      const stepsInstances = propagateSteps.propagate(mergedInstances)
      const modelInstances = propagateModel.propagate(stepsInstances, schemas)
      const showInstances = propagateShow.propagate(modelInstances)
      const instances = showInstances
      const sourceInstancesData = {}
      sourceInstances.forEach(sourceInstance => {
        const sourceInstanceObj = {}
        sourceInstance.instances.forEach(instance => {
          sourceInstanceObj[instance._id] = instance
        })
        sourceInstancesData[sourceInstance.source] = sourceInstanceObj
      })
      instances.sourceInstances = {
        _type: 'sourceInstances',
        data: sourceInstancesData
      }
      return instances
    })
}

module.exports = {
  getRuntimeData
}
