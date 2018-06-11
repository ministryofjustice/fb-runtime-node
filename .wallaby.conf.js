module.exports = () => ({
  files: [
    { pattern: 'lib/**/*.js', load: false },
    "!lib/**/*.unit.spec.js",
    { pattern: 'data/**/*.json', load: false }
  ],
  tests: [
    'lib/**/*.unit.spec.js'
  ],
  env: {
    type: 'node'
  },
  testFramework: 'tape',
  workers: {
    restart: true
  }
})
