'use strict'

const Hp = require('hemera-plugin');
const _ = require('lodash');

var endpoints = ["create" ,"update" ,"updateById" ,"find" ,"findById" ,"remove" ,"removeById" ,"replace" ,"replaceById" ,"exists"];

exports.plugin = Hp(function hemeraEntity (options, next) {
  const hemera = this
  const topic = 'entity'
  var default_options = require('./default-options.json')
  options = _.defaultsDeep(options, default_options);

  /**
   * Initialization of plugin. Added entity with endpoints
   * @return {[type]}     [description]
   */

    console.info('Creating dynamic entity: ' + options.role);

    for (var k in endpoints) {

        var endpoint = endpoints[k];
        console.info('Creating dynamic endpoint: ' + endpoint);

        hemera.add({
            topic: options.role,
            cmd: endpoint,
        }, function (req, cb) {

            var store = _.extend(req,{ topic: options.store,
                                cmd: req.cmd,
                                collection: options.collection});

            hemera.act(store, function (err, resp) {
                return cb(err, resp);
            })
        });
    }

  next()
})

exports.options = {}

exports.attributes = {
  pkg: require('./package.json')
}
