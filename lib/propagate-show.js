/**
 * @module propagateShow
 **/

const jp = require('jsonpath')
const {deepClone, FBLogger} = require('@ministryofjustice/fb-utils-node')
const {getEntryPointKeys} = require('./entry-points')

const propagate = instances => {
  instances = deepClone(instances)

  const createAllConditions = (...condtions) => {
    const definedConditions = condtions.filter(condition => condition)
    if (!definedConditions.length) {
      return
    }
    if (definedConditions.length === 1) {
      return definedConditions[0]
    }

    const allOf = deepClone(definedConditions)
      .map(condition => condition.allOfConditions ? condition.allOfConditions : condition)
    const allOfConditions = [].concat(...allOf)

    // possible optimisation to push additonal conditions on to existing allOf
    // NB. but ensure to clone in this case
    // OTOH, why not do it by reference?
    return {
      _type: 'condition',
      allOfConditions
      // : definedConditions
    }
  }

  jp.paths(instances, '$..["components","items"]').reverse().forEach(instancePath => {
  // jp.query(instances, '$..[?(@.components || @.items)]').reverse().forEach(collectionInstance => {
    const collectionType = instancePath.pop()
    // Not sure why jsonpath puts this value in the path array - but it does
    const collectionInstancePath = jp.stringify(instancePath).replace(/\.value/, '')
    const instance = jp.query(instances, collectionInstancePath)[0]
    const instanceCollection = instance[collectionType]
    const shows = instanceCollection.map(item => item.show).filter(show => show)
    // if all the items have a condition, the collection of items must satisfy at least one of them
    if (shows.length === instanceCollection.length) {
      // no need to match anyof if there's only one condition
      // Is there really a need for this optimisation though?
      const instanceShow = shows.length === 1 ? deepClone(shows[0]) : {
        _type: 'condition',
        anyOfConditions: deepClone(shows)
      }
      // // if the collection has no conditions, then simply assign the consolidated items conditions
      // if (!instance.show) {
      //   instance.show = instanceShow
      // } else {
      //   // if the collection has conditions, then new show must satisfy those and the consolidated items conditions
      //   // const instanceShowAll = {
      //   //   _type: 'condition',
      //   //   allOfConditions: [
      //   //     instance.show,
      //   //     instanceShow
      //   //   ]
      //   // }
      //   const instanceShowAll = createAllConditions(instance.show, instanceShow)
      //   instance.show = instanceShowAll
      // }
      // the next line is equivalent to the above
      instance.show = createAllConditions(instance.show, instanceShow)
    }
  })

  const propagateStepConditions = (instance) => {
    FBLogger('prop', instance._id)
    if (instance.steps) {
      // let showSteps = instance.showSteps
      // const instanceShow = instance.show
      // if (instanceShow) {
      //   showSteps = showSteps ? createAllConditions(instanceShow, showSteps) : instanceShow
      // }
      let showSteps = createAllConditions(instance.show, instance.showSteps)
      instance.steps.forEach(step => {
        const stepInstance = instances[step]
        if (showSteps) {
          // stepInstance.show = stepInstance.show ? createAllConditions(showSteps, stepInstance.show) : showSteps
          stepInstance.show = createAllConditions(showSteps, stepInstance.show)
        }
        propagateStepConditions(stepInstance)
      })
    }
  }

  let pageKeys = getEntryPointKeys(instances)
  pageKeys.forEach(key => {
    propagateStepConditions(instances[key])
  })

  return instances
}
module.exports = {
  propagate
}
