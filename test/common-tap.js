// cheesy hackaround for test deps (read: nock) that rely on setImmediate
if (!global.setImmediate || !require('timers').setImmediate) {
  require('timers').setImmediate = global.setImmediate = function () {
    var args = [arguments[0], 0].concat([].slice.call(arguments, 1))
    setTimeout.apply(this, args)
  }
}

var spawn = require("child_process").spawn
var path = require("path")

var port = exports.port = 1337
exports.registry = "http://localhost:" + port
process.env.npm_config_loglevel = "error"

var npm_config_cache = path.resolve(__dirname, "npm_cache")
process.env.npm_config_cache = exports.npm_config_cache = npm_config_cache
process.env.npm_config_userconfig = exports.npm_config_userconfig = path.join(__dirname, "fixtures", "config", "userconfig")
process.env.npm_config_globalconfig = exports.npm_config_globalconfig = path.join(__dirname, "fixtures", "config", "globalconfig")
process.env.random_env_var = "foo"

var bin = exports.bin = require.resolve("../bin/npm-cli.js")
var once = require("once")

exports.npm = function (cmd, opts, cb) {
  cb = once(cb)
  cmd = [bin].concat(cmd)
  opts = opts || {}

  opts.env = opts.env || process.env
  if (!opts.env.npm_config_cache) {
    opts.env.npm_config_cache = npm_config_cache
  }

  var stdout = ""
    , stderr = ""
    , node = process.execPath
    , child = spawn(node, cmd, opts)

  if (child.stderr) child.stderr.on("data", function (chunk) {
    stderr += chunk
  })

  if (child.stdout) child.stdout.on("data", function (chunk) {
    stdout += chunk
  })

  child.on("error", cb)

  child.on("close", function (code) {
    cb(null, code, stdout, stderr)
  })
  return child
}
