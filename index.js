'use strict'

const fs = require("fs")
const os = require("os")

/**
 * Get OS release info from '/etc/os-release' file and from node os module. If
 * Windows or Mac return only the node os module's info.
 *
 * @returns info {object} via Promise | callback | return value
 */
module.exports = function (opts) {

  let outputData = {
    type: os.type(),
    platform: os.platform(),
    hostname: os.hostname(),
    arch: os.arch(),
    release: os.release(),
  }

  if (os.type() !== 'Linux') {
    return resolve(outputData)
  }

  let mode = 'promise'

  if (typeof opts === 'function') {
    // do a callback
    mode = 'callback'
    return asyncRead()
  } else if (opts && opts.synchronous) {
    // do it synchronously
    let data = fs.readFileSync('/etc/os-release', 'utf8')
    addOsReleaseToOutputData(data)
    return outputData
  } else {
    // return a promise just like it does now
    return new Promise(asyncRead)
  }

  function asyncRead (resolve, reject) {
    fs.readFile('/etc/os-release', 'utf8', (err, data) => {
      if (err) {
        mode === 'promise' ? reject(err) : opts(err)
        return
      }

      addOsReleaseToOutputData(data)

      mode === 'promise' ? resolve(outputData) : opts(null, outputData)
    })
  }

  function splitOnce(string, delimiter) {
    let index = string.indexOf(delimiter)
    return [string.slice(0, index), string.slice(index + 1)]
  }

  function addOsReleaseToOutputData(data) {
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
}
