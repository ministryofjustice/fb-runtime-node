/**
 * @module getRuntimeData
 **/

const loadJSON = require('./load-json')
const mergeInstances = require('./merge-instances')
const propagateModel = require('./propagate-model')
const propagateSteps = require('./propagate-steps')
// const propagateModel = require('./propagate-model')
const propagateShow = require('./propagate-show')
const injectRepeatablePages = require('./inject-repeatable-pages')
const internationalizeRoutes = require('./internationalize-routes')

const getRuntimeData = (sourceObjs, schemas) => {
  return loadJSON.load(sourceObjs)
    .then(sourceInstances => {
      const mergedInstances = mergeInstances.merge(sourceInstances)
      const stepsInstances = propagateSteps.propagate(mergedInstances)
      const modelInstances = propagateModel.propagate(stepsInstances, schemas)
      const showInstances = propagateShow.propagate(modelInstances)
      const repeatableInstances = injectRepeatablePages.inject(showInstances)
      const i18nRouteInstances = internationalizeRoutes.i18nUrls(repeatableInstances)
      const instances = i18nRouteInstances

      // // provide fallback i18nised URLs of form  /:lang/:url
      // const service = instances.service || {}
      // const languages = (service.languages || []).filter(lang => lang !== (service.languageDefault || 'en'))
      // Object.keys(instances).filter(_id => instances[_id]._type && instances[_id]._type.startsWith('page.'))
      //   .forEach(_id => {
      //     const instance = instances[_id]
      //     if (instance.url) {
      //       languages.forEach(lang => {
      //         const urlLang = `url:${lang}`
      //         if (instance[urlLang] === undefined) {
      //           instance[urlLang] = `/${lang}${instance.url}`.replace(/\/$/, '')
      //         } else {
      //           if (!instance[urlLang].startsWith('/')) {
      //             instance[urlLang] = `/${instance[urlLang]}`
      //           }
      //         }
      //       })
      //     }
      //   })

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
