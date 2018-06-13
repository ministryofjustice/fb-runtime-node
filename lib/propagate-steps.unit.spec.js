const test = require('tape')
const path = require('path')
const jp = require('jsonpath')

const {deepClone} = require('@ministryofjustice/fb-utils-node')

const {propagateSteps} = require('./propagate-steps')

const getTestData = name => {
  const dataPath = path.resolve('data', 'steps', `${name}.json`)
  return require(dataPath)
}

const getNestedInstance = (instances, id) => {
  return jp.query(instances, `$..[?(@._id === "${id}")]`)[0]
}

test('When adding _parent properties to step instances', function (t) {
  const input = getTestData('input-a')
  const instances = propagateSteps(input)

  const withParents = Object.keys(instances).filter(key => instances[key]._parent)
  t.equal(withParents.length, 3, 'it should add the _parent ref to the correct number of instances')
  const parentValues = instances.stepA._parent === 'topA' &&
    instances.stepB._parent === 'topA' &&
    instances.stepC._parent === 'stepA'
  t.ok(parentValues, 'it should set the correct _parent values')

  t.end()
})

test('When a step is referenced by multiple parent pages', function (t) {
  const badData = getTestData('input-duplicate-step-ref')
  try {
    /* eslint-disable no-unused-vars */
    const instances = propagateSteps(badData)
    /* eslint-enable no-unused-vars */
  } catch (e) {
    t.equal(e.name, 'FBPageParentError', 'it should return a FBPageParentError')
    t.equal(e.data.step, 'stepA', 'it should return the duplicated step')
    const eInstances = e.data.instances
    t.notDeepEqual(eInstances.stepA, badData.stepA, 'it should have altered the duplicated step')
    delete eInstances.stepA
    const badDataClone = deepClone(badData)
    delete badDataClone.stepA
    t.deepEqual(eInstances, badDataClone, 'it should not have altered the parent pages')
  }

  t.end()
})

test('When processing step instances for section headings', function (t) {
  const input = getTestData('input-step-heading')
  const instances = propagateSteps(input)

  t.equal(getNestedInstance(instances, 'stepA').sectionHeading, 'Top A section heading', 'it should copy step headings to step sectionHeading property')
  t.equal(getNestedInstance(instances, 'stepC').sectionHeading, 'Top A section heading', 'it should copy step headings recursively')
  t.equal(getNestedInstance(instances, 'stepB').sectionHeading, 'Step B section heading', 'it should not copy step headings to steps that have a sectionHeading property')
  t.equal(getNestedInstance(instances, 'stepE').sectionHeading, 'Step B section heading', 'it should copy step headings recursively even if not at root level')
  t.equal(getNestedInstance(instances, 'stepD').sectionHeading, '', 'it should not copy step headings to steps that have an explicitly empty sectionHeading property')

  t.end()
})
