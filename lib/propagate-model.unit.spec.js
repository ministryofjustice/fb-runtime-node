const test = require('tape')

const {FBLogger} = require('@ministryofjustice/fb-utils-node')

const {propagate} = require('./propagate-model')

const data = {
  foo: {
    _id: 'foo',
    _type: 'page.wham',
    model: 'foomodel',
    components: [
      {
        _id: 'foo-group',
        _type: 'group',
        model: 'wham',
        items: [
          {
            _id: 'foo-group-a',
            _type: 'text',
            show: {
              _id: 'condition.text_is',
              _type: 'condition',
              identifier: 'foo',
              operator: 'is',
              value: 'bar'
            }
          }
        ]
      },
      {
        _id: 'foo-bar',
        _type: 'text'
      },
      {
        _id: 'foo-bim',
        _type: 'content'
      },
      {
        _id: 'foo-with-model',
        _type: 'radios',
        model: 'monkey',
        modelProtect: true,
        show: {
          _id: 'gosh',
          anyOfConditions: [
            {
              identifier: 'foo',
              operator: 'is',
              value: 'bar'
            },
            {
              allOfConditions: [
                {
                  identifier: 'bam',
                  operator: 'equals',
                  value: 20
                },
                {
                  identifier: 'baz',
                  operator: 'is',
                  value: 'bar',
                  negated: true
                }
              ]
            }
          ]
        }
      }
    ]
  }
}

test('When loading the json', function (t) {
  FBLogger(propagate(data))
  t.end()
})
