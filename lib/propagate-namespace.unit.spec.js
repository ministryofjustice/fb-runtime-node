const test = require('tape')
const path = require('path')

const jp = require('jsonpath')

const {propagate} = require('./propagate-namespace')

const getTestData = name => {
  const dataPath = path.resolve('data', 'namespace', `${name}.json`)
  return require(dataPath)
}
const schemas = getTestData('schemas')

const getNestedInstance = (instances, id) => {
  return jp.query(instances, `$..[?(@._id === "${id}")]`)[0]
}

test('When propagating a namespace property', function (t) {
  const input = getTestData('input-a')

  const instances = propagate(input, schemas)

  const foo = getNestedInstance(instances, 'foo')
  t.deepEqual(foo.$page, true, 'it should set the $[category] property of instances')

  // these tests no longer make sense - but keeping them to form basis of equivalent method in runner

  // t.equal(foo.namePrefix, 'foonamespace', 'it should set the namePrefix property of instances with a namespace')
  // t.deepEqual(foo.$namespaces, ['foonamespace'], 'it should set the $namespaces property of instances with a namespace')

  // const fooBar = getNestedInstance(instances, 'foo-bar')
  // t.equal(fooBar.namePrefix, 'foonamespace', 'it should add the namePrefix property to nested controls')
  // t.deepEqual(fooBar.$namespaces, ['foonamespace'], 'it should add the $namespaces property to nested controls')

  // const fooBim = getNestedInstance(instances, 'foo-bim')
  // t.equal(fooBim.namePrefix, undefined, 'it should not add the namePrefix property to content blocks')
  // t.deepEqual(fooBim.$namespaces, undefined, 'it should not add the $namespaces property to content blocks')

  // const fooGroup = getNestedInstance(instances, 'foo-group')
  // t.equal(fooGroup.namePrefix, 'foonamespace[wham]', 'it should add the namePrefix property to nested groupings')
  // t.deepEqual(fooGroup.$namespaces, ['foonamespace', 'wham'], 'it should add the $namespaces property to nested groupings')

  // const fooGroupA = getNestedInstance(instances, 'foo-group-a')
  // t.equal(fooGroupA.namePrefix, 'foonamespace[wham]', 'it should add the namePrefix property to controls nested in groupings')
  // t.equal(fooGroupA.name, 'foonamespace[wham][foo-group-a-text]', 'it should update the name property on controls nested in groupings')
  // t.deepEqual(fooGroupA.$namespaces, ['foonamespace', 'wham'], 'it should add the $namespaces property to controls nested in groupings')

  // const fooWithNamespace = getNestedInstance(instances, 'foo-with-namespace')
  // t.equal(fooWithNamespace.namePrefix, 'monkey', 'it should not propagate the namePrefix property on instances where namespaceProtect is true')
  // t.deepEqual(fooWithNamespace.$namespaces, ['monkey'], 'it should not propagate the $namespaces property on instances where namespaceProtect is true')

  t.end()
})

test('When propagating namespaces', t => {
  const input = getTestData('input-a')

  const instances = propagate(input, schemas)
  t.equal(jp.query(instances, '$..[?(@.$namespaceUpdated)]').length, 0, 'it should not include instances with $namespaceUpdated properties')

  t.end()
})
