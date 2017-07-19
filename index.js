'use strict'

const Hp = require('hemera-plugin');
const _ = require('lodash');

var endpoints = ["create" ,"update" ,"updateById" ,"find" ,"findById" ,"remove" ,"removeById" ,"replace" ,"replaceById" ,"exists"];

exports.plugin = Hp(function hemeraEntity (options, next) {
  const hemera = this
  const topic = 'entity'
  var default_options = require('./default-options.json')
  options = _.extend(default_options, options);
  var entities = options.entities;

  /**
   * Initialization of plugin. Added entity for ENTITIES
   * @param  {[type]} var i             in entities [description]
   * @return {[type]}     [description]
   */
  for (var i in entities) {
      var entity = entities[i];
      console.log('Creating dynamic entity: ' + entity.name);

      for (var k in endpoints) {

          var endpoint = endpoints[k];
          console.log('Creating dynamic endpoint: ' + endpoint);

          hemera.add({
              topic: entity.name,
              cmd: endpoint
          }, function (req, cb) {

              var store = _.extend(req,{ topic: 'mongo-store',
                                  cmd: req.cmd,
                                  collection: req.topic});

              hemera.act(store, function (err, resp) {
                  return cb(err, resp);
              })
          });
      }
  }

  next()
})

exports.options = {}

exports.attributes = {
  pkg: require('./package.json')
}
