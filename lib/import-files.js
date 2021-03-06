var assert = require('assert')
var match = require('anymatch')
var countFiles = require('count-files')
var hyperImport = require('hyperdrive-import-files')
var debug = require('debug')('dat-node')

module.exports = importer

function importer (archive, target, opts, cb) {
  assert.ok(archive, 'lib/import-files archive required')
  assert.ok(target, 'lib/import-files target directory required')
  if (typeof opts === 'function') return importer(archive, target, {}, opts)

  opts = opts || {}

  // Set default ignore and hidden ignore option
  var defaultIgnore = [/^(?:\/.*)?\.dat(?:\/.*)?$/] // ignore .dat
  if (opts.ignoreHidden !== false) defaultIgnore.push(/[/\\]\./) // ignore all hidden things

  // Update ignore with any opts passed
  if (!opts.ignore) opts.ignore = defaultIgnore // no opt, use default
  else if (Array.isArray(opts.ignore)) opts.ignore = opts.ignore.concat(defaultIgnore)
  else opts.ignore = [opts.ignore].concat(defaultIgnore)

  var importer = hyperImport(archive, target, opts, cb)

  importer.options = importer.options || opts

  debug('Importer created. Counting Files.')
  // Start counting the files
  var ignore = function (file) {
    return match(opts.ignore, file)
  }
  var countStats = countFiles(target, {ignore: ignore}, function (err, stats) {
    if (err) cb(err)
    debug('File count finished', countStats)
    importer.emit('count finished', countStats)
  })
  importer.countStats = countStats // TODO: make importer vs count stats clearer

  return importer
}
