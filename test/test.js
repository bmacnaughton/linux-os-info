const osInfo = require('../index')
const should = require('should')
const os = require('os')
const fs = require('fs')

let osData = {
  type: os.type(),
  platform: os.platform(),
  hostname: os.hostname(),
  arch: os.arch(),
  release: os.release(),
}

let osRelease = fs.readFileSync('/etc/os-release', 'utf8')
let lines = osRelease.split('\n')

// use different logic to determine the KV pairs
let osKVPairs = {}
lines.forEach(line => {
  let m = line.match(/(.+)=("{0,1})(.*)\2/)
  if (m) {
    osKVPairs[m[1].toLowerCase()] = m[3]
  }
})
let expected = Object.assign({}, osData, osKVPairs)

//
// run the tests
//
describe('os-release-info', function () {
  it('should work by returning a promise', function (done) {
    let p = osInfo()
    p.should.be.instanceOf(Promise)

    p.then(info => {
      compare(info, expected)
      done()
    }).catch(e => {
      throw e
      done()
    })
  })

  it('should work with a callback', function (done) {
    osInfo(function (err, info) {
      compare(info, expected)
      done()
    })
  })

  it('should work synchronously', function () {
    let info = osInfo({synchronous: true})
    compare(info, expected)
  })

  describe('OS-specific tests', function () {
    let info = osInfo({synchronous: true})

    //
    test = info.version_codename === 'bionic' ? it : it.skip
    test('should handle a quoted value for bionic beaver', function () {
      info.pretty_name.should.equal('Ubuntu 18.04 LTS')
    })
    test('should handle an unquoted value for bionic beaver', function () {
      info.id.should.equal('ubuntu')
    })

    // add your tests here
  })

  function compare (info, expected) {
    let iKeys = Object.keys(info)
    let eKeys = Object.keys(expected)

    iKeys.forEach(key => {
      expected.should.have.property(key, info[key])
    })

    iKeys.length.should.equal(eKeys.length)
  }

  function test (condition) {
    return condition ? it : it.skip
  }

})


