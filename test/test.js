const osInfo = require('../index')
const os = require('os')
const fs = require('fs')
const expect = require('chai').expect;

let osData = {
  type: os.type(),
  platform: os.platform(),
  hostname: os.hostname(),
  arch: os.arch(),
  release: os.release(),
  file: undefined,
}

const paths = ['/etc/os-release', '/usr/lib/os-release', '/etc/alpine-release']

let osRelease
for (let i = 0; i < paths.length; i++) {
  try {
    osRelease = fs.readFileSync(paths[i], 'utf8')
    if (osRelease) {
      osData.file = paths[i]
      break
    }
  } catch (e) {
    console.log('could not read', paths[i])
  }
}
let expected

if (osData.file === '/etc/alpine-release') {
  osData.name = 'Alpine'
  osData.id = 'alpine'
  osData.version = osRelease
  osData.version_id = osRelease
  expected = osData
} else {
  let lines = osRelease ? osRelease.split('\n') : [];

  // use different logic to determine the KV pairs
  let osKVPairs = {}
  lines.forEach(line => {
    let m = line.match(/(.+)=("{0,1})(.*)\2/)
    if (m) {
      osKVPairs[m[1].toLowerCase()] = m[3]
    }
  })
  expected = Object.assign({}, osData, osKVPairs)
}

//
// run the tests
//
describe('linux-os-info', function () {
  it('should work by returning a promise', function (done) {
    let p = osInfo()
    expect(p).instanceOf(Promise);

    p.then(info => {
      compare(info, expected)
      done()
    }).catch(e => {
      throw e
      done()
    })
  })

  it('should work with a callback', function (done) {
    osInfo({mode: function (err, info) {
      compare(info, expected)
      done()
    }})
  })

  it('should work synchronously', function () {
    let info = osInfo({mode: 'sync'})
    compare(info, expected)
  })

  it('should return os info when no release file is found', function () {
    let info = osInfo({mode: 'sync', list: []})
    let e = os.type() === 'Linux' ? new Error('linux-os-info - no file found') : undefined;
    let expected = Object.assign({}, osData, {file: e})
    compare(info, expected)

    osInfo({mode: function (err, info) {
      compare(info, expected)
    }, list: []})

    osInfo({list: []}).then(info => {
      compare(info, expected)
    })
  })

  describe('OS-specific tests', function () {
    let info = osInfo({mode: 'sync'})

    // ubuntu 18.04
    test = info.version_codename === 'bionic' ? it : it.skip
    test('should handle a quoted value for bionic beaver', function () {
      expect(info.pretty_name).equal('Ubuntu 18.04 LTS');
    })
    test('should handle an unquoted value for bionic beaver', function () {
      expect(info.id).equal('ubuntu');
    })

    // ubuntu 17.10
    test = info.version_codename === 'artful' ? it : it.skip
    test('should handle a quoted value for artful aardvark', function () {
      expect(info.pretty_name).equal('Ubuntu 17.10');
    });

    // windows
    test = info.type === 'Windows_NT' ? it : it.skip;
    test('should return windows OS information', function () {
      expect(info.platform).equal('win32');
      expect(info.arch).equal('x64');
      expect(info.release).match(/\d+\.\d+\.\d+/);
    });
  })

  function compare (info, expected) {
    let iKeys = Object.keys(info)
    let eKeys = Object.keys(expected)

    iKeys.forEach(key => {
      expect(info).property(key, expected[key]);
    })

    expect(iKeys.length).equal(eKeys.length);
  }

  function test (condition) {
    return condition ? it : it.skip
  }

})


