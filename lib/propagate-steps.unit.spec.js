const test = require('tape')
const {deepClone} = require('@ministryofjustice/fb-utils-node')

const {propagateSteps} = require('./propagate-steps')

const data = {
  topA: {
    _id: 'topA',
    _type: 'page.start',
    steps: [
      'stepA',
      'stepB'
    ]
  },
  stepA: {
    _id: 'stepA',
    _type: 'page.singlequestion',
    steps: [
      'stepC'
    ]
  },
  stepB: {
    _id: 'stepB',
    _type: 'page.form'
  },
  stepC: {
    _id: 'stepC',
    _type: 'page.content'
  },
  topB: {
    _id: 'topB',
    _type: 'page.content'
  }
}

const badData = {
  topA: {
    _id: 'topA',
    _type: 'page.start',
    steps: [
      'stepA'
    ]
  },
  stepA: {
    _id: 'stepA',
    _type: 'page.singlequestion'
  },
  topB: {
    _id: 'topB',
    _type: 'page.form',
    steps: [
      'stepA'
    ]
  }
}

test('When adding _parent properties to step instances', function (t) {
  const instances = propagateSteps(data)

  const withParents = Object.keys(instances).filter(key => instances[key]._parent)
  t.equal(withParents.length, 3, 'it should add the _parent ref to the correct number of instances')
  const parentValues = instances.stepA._parent === 'topA' &&
    instances.stepB._parent === 'topA' &&
    instances.stepC._parent === 'stepA'
  t.ok(parentValues, 'it should set the correct _parent values')

  t.end()
})

test('When a step is referenced by multiple parent pages', function (t) {
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
