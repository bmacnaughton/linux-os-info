'use strict'

const fs = require("fs")
const os = require("os")

/**
 * Get OS release info from '/etc/os-release' file and from node os module. If
 * Windows or Mac return only the node os module's info.
 *
 * @returns info {object} via Promise | callback | return value
 */
function linuxOsInfo (opts) {
  let outputData = {
    type: os.type(),
    platform: os.platform(),
    hostname: os.hostname(),
    arch: os.arch(),
    release: os.release(),
    file: undefined,
  }

  let mode = 'promise'
  opts = opts || {}

  const list = opts.list || defaultList

  if (typeof opts.mode === 'function') {
    mode = 'callback'
  } else if (opts.mode === 'sync') {
    mode = 'sync'
  }

  if (os.type() !== 'Linux') {
    if (mode === 'promise') {
      return Promise.resolve(outputData)
    } else if (mode === 'callback') {
      return opts.mode(null, outputData)
    } else {
      return outputData
    }
  }

  if (mode === 'sync') {
    return synchronousRead()
  } else {
    // return a Promise that can be ignored if caller expects a callback
    return new Promise(asynchronousRead)
  }

  // loop through the file list synchronously
  function synchronousRead () {
    for (let i = 0; i < list.length; i++) {
      let data
      try {
        data = fs.readFileSync(list[i].path, 'utf8')
        list[i].parser(data, outputData)
        outputData.file = list[i].path
        return outputData
      } catch (e) {
        // accumulate errors?
      }
    }
    outputData.file = new Error('linux-os-info - no file found')
    return outputData
  }

  // loop through the file list on completion of async reads
  function asynchronousRead (resolve, reject) {
    let i = 0

    function tryRead (file) {
      fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
          i += 1
          if (i >= list.length) {
            const e = new Error('linux-os-info - no file found')
            outputData.file = e
            mode === 'promise' ? resolve(outputData) : opts.mode(null, outputData)
          } else {
            tryRead(list[i].path)
          }
        } else {
          list[i].parser(data, outputData)
          outputData.file = file
          mode === 'promise' ? resolve(outputData) : opts.mode(null, outputData)
          return
        }
      })
    }

    tryRead(list[i].path)
  }

}

//
// helper functions to parse file data
//

const defaultList = [
  {path: '/etc/os-release', parser: etcOsRelease},
  {path: '/usr/lib/os-release', parser: usrLibOsRelease},
  {path: '/etc/alpine-release', parser: etcAlpineRelease}
]

function etcOsRelease(data, outputData) {
  addOsReleaseToOutputData(data, outputData)
}

function usrLibOsRelease(data, outputData) {
  addOsReleaseToOutputData(data, outputData)
}

function etcAlpineRelease(data, outputData) {
  outputData.name = 'Alpine'
  outputData.id = 'alpine'
  outputData.version = data
  outputData.version_id = data
}

function splitOnce(string, delimiter) {
  let index = string.indexOf(delimiter)
  return [string.slice(0, index), string.slice(index + 1)]
}

function addOsReleaseToOutputData(data, outputData) {
  const lines = data.split('\n')

  lines.forEach(line => {
    let index = line.indexOf('=')
    // only look at lines with at least a one character key
    if (index >= 1) {
      // lowercase key and remove quotes on value
      let key = line.slice(0, index).toLowerCase()
      let value = line.slice(index + 1).replace(/"/g, '')

      Object.defineProperty(outputData, key, {
        value: value,
        writable: true,
        enumerable: true,
        configurable: true
      })
    }
  });
}

module.exports = linuxOsInfo

if (require.main === module) {

  console.log('testing synchronous')
  console.log('synchronous:', linuxOsInfo({mode: 'sync'}))

  console.log('testing promise')
  linuxOsInfo()
    .then(r => console.log('promise:', r))
    .catch(e => console.log('promise error:', e))

  console.log('testing callback')
  linuxOsInfo({mode: function (err, data) {console.log('callback:', data)}})
}
