const test = require('tape')

const {FBLogger} = require('@ministryofjustice/fb-utils-node')

const {propagate} = require('./propagate-show')

const data = {
  fim: {
    _id: 'fim',
    _type: 'page.start',
    steps: [
      'bim',
      'bam'
    ],
    showSteps: {
      _id: 'showSteps.fim',
      _type: 'condition',
      identifier: 'crumpet',
      operator: 'exists'
    }
  },
  bim: {
    _id: 'bim',
    _type: 'page.singlequestion'
  },
  bam: {
    _id: 'bam',
    _type: 'page.form',
    show: {
      _id: 'condition.bam',
      _type: 'condition',
      identifier: 'goo',
      operator: 'is',
      value: 'gar'
    },
    showSteps: {
      _id: 'showSteps.bam',
      _type: 'condition',
      identifier: 'sigh',
      operator: 'truthy'
    },
    steps: [
      'tosh'
    ]
  },
  tosh: {
    _id: 'tosh',
    _type: 'page.singlequestion'
  },
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
        _type: 'text',
        show: {
          _id: 'bah',
          _type: 'condition',
          identifier: 'wonky',
          operator: 'is',
          value: 'donkey'
        },
        items: [
          {
            _id: 'foo-group-z',
            _type: 'text',
            show: {
              _id: 'nooo',
              _type: 'condition',
              identifier: 'foo',
              operator: 'is',
              value: 'bar'
            }
          },
          {
            _id: 'foo-group-z2',
            _type: 'text',
            show: {
              _id: 'weee',
              _type: 'condition',
              identifier: 'we',
              operator: 'equals',
              value: 100
            }
          }
        ]
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
              identifier: 'shonk',
              operator: 'is',
              value: 'twonl'
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
  const instances = propagate(data)
  // delete instances.foo
  FBLogger('----------------------', instances)
  t.end()
})