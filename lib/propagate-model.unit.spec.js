const test = require('tape')
const path = require('path')

const jp = require('jsonpath')

const {propagate} = require('./propagate-model')

const getTestData = name => {
  const dataPath = path.resolve('data', 'model', `${name}.json`)
  return require(dataPath)
}
const schemas = getTestData('schemas')

const getNestedInstance = (instances, id) => {
  return jp.query(instances, `$..[?(@._id === "${id}")]`)[0]
}

test('When propagating a model property', function (t) {
  const input = getTestData('input-a')

  const instances = propagate(input, schemas)

  const foo = getNestedInstance(instances, 'foo')
  t.equal(foo.namePrefix, 'foomodel', 'it should set the namePrefix property of instances with a model')
  t.deepEqual(foo.$models, ['foomodel'], 'it should set the $models property of instances with a model')

  const fooBar = getNestedInstance(instances, 'foo-bar')
  t.equal(fooBar.namePrefix, 'foomodel', 'it should add the namePrefix property to nested controls')
  t.deepEqual(fooBar.$models, ['foomodel'], 'it should add the $models property to nested controls')

  const fooBim = getNestedInstance(instances, 'foo-bim')
  t.equal(fooBim.namePrefix, undefined, 'it should not add the namePrefix property to content blocks')
  t.deepEqual(fooBim.$models, undefined, 'it should not add the $models property to content blocks')

  const fooGroup = getNestedInstance(instances, 'foo-group')
  t.equal(fooGroup.namePrefix, 'foomodel[wham]', 'it should add the namePrefix property to nested groupings')
  t.deepEqual(fooGroup.$models, ['foomodel', 'wham'], 'it should add the $models property to nested groupings')

  const fooGroupA = getNestedInstance(instances, 'foo-group-a')
  t.equal(fooGroupA.namePrefix, 'foomodel[wham]', 'it should add the namePrefix property to controls nested in groupings')
  t.equal(fooGroupA.name, 'foomodel[wham][foo-group-a-text]', 'it should update the name property on controls nested in groupings')
  t.deepEqual(fooGroupA.$models, ['foomodel', 'wham'], 'it should add the $models property to controls nested in groupings')

  const fooWithModel = getNestedInstance(instances, 'foo-with-model')
  t.equal(fooWithModel.namePrefix, 'monkey', 'it should not propagate the namePrefix property on instances where modelProtect is true')
  t.deepEqual(fooWithModel.$models, ['monkey'], 'it should not propagate the $models property on instances where modelProtect is true')

  t.end()
})

test('When propagating models', t => {
  const input = getTestData('input-a')

  const instances = propagate(input, schemas)
  t.equal(jp.query(instances, '$..[?(@.$modelUpdated)]').length, 0, 'it should not include instances with $modelUpdated properties')

  t.end()
})
