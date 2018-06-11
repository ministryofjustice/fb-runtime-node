/**
 * @module jsonmerger
 **/

const jp = require('jsonpath')

const {FBLogger, FBError, clone, deepClone} = require('@ministryofjustice/fb-utils-node')

class JSONMergeError extends FBError {}

const annotateInstances = (sourceObj) => {
  const annotateSourceObj = clone(sourceObj)
  const source = annotateSourceObj.source
  annotateSourceObj.instances = annotateSourceObj.instances.map(instance => {
    return Object.assign({$source: source}, instance)
  })
  return annotateSourceObj
}

const flattenInstances = (sourceObjs) => {
  const instances = {}
  const processed = {}

  const instancesBySource = {}
  sourceObjs.forEach(sourceObj => {
    const sourceName = sourceObj.source
    instancesBySource[sourceName] = {}
    sourceObj.instances.forEach(instance => {
      instancesBySource[sourceName][instance._id] = clone(instance)
    })
  })
  const sources = sourceObjs.map(sourceObj => sourceObj.source).reverse()

  const expandIsa = (instance) => {
    let isaSource
    let isaId = instance._isa.replace(/(.*)=>(.*)/, (m, m1, m2) => {
      isaSource = m1
      return m2
    })
    if (!isaSource) {
      for (let i = 0; i < sources.length; i++) {
        if (instancesBySource[sources[i]][isaId]) {
          isaSource = sources[i]
          break
        }
      }
    }

    if (!isaSource) {
      throw new JSONMergeError({
        message: `No source found for instance ${isaId}`,
        code: 'ENOINSTANCESOURCE'
      })
    }
    const originalInstance = deepClone(instance)
    const isaInstance = expandInstanceRef(instancesBySource[isaSource][isaId])
    instance = Object.assign({}, isaInstance, instance)

    instance.$original = originalInstance
    return instance
  }

  const expandInstanceRef = (instance) => {
    const processedKey = `${instance.$source}=>${instance._id}`
    if (processed[processedKey]) {
      return instance
    }

    // if (instance._isa) {
    //   instance = expandIsa(instance)
    // }

    // jsonpath can't set a value on the object itself
    const instanceWrapper = {
      instance
    }

    const isaPaths = jp.paths(instanceWrapper, '$.._isa')
    isaPaths.forEach(isaPath => {
      isaPath.pop()
      const propertyPath = jp.stringify(isaPath)
      // if (propertyPath === '$') {
      //   return
      // }
      const isaRefPropertyInstance = expandIsa(jp.query(instanceWrapper, propertyPath)[0])
      jp.value(instanceWrapper, propertyPath, isaRefPropertyInstance)
    })

    processed[processedKey] = true
    return instance
  }

  sources.forEach(sourceName => {
    Object.keys(instancesBySource[sourceName]).forEach(instanceId => {
      let instance = instancesBySource[sourceName][instanceId]
      if (!instances[instance._id]) {
        instances[instance._id] = expandInstanceRef(instance)
      } else {
        FBLogger(`already got ${instance._id}`)
      }
    })
  })
  return instances
}

// /**
//  * Load json files from multiple locations
//  * @async
//  * @param {array.<{source: string, path: string}>} sources
//  *  Array of objects specifying
//  *  - path to load json from
//  *  - source as key return loaded data against
//  * @return {Promise.<array.<{source: string, data: array}>>}
//  *  Promised array of loaded json
//  **/
const merge = sources => {
  const annotatedSources = sources.map(sourceObj => annotateInstances(sourceObj))
  const flattenedSources = flattenInstances(annotatedSources)
  return flattenedSources
}
module.exports = {
  merge
}
