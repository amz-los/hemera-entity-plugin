'use strict'

const Hp = require('hemera-plugin');
const _ = require('lodash');


var endpoints = ["create", "update", "updateById", "find", "findById", "remove", "removeById", "replace", "replaceById", "exists"];

exports.plugin = Hp(function hemeraEntity(options, next) {

    const hemera = this

    var default_options = require('./default-options.json')
    options = _.defaultsDeep(options, default_options);


    /**
     * Initialization of plugin. Added entity with endpoints
     * @return {[type]}     [description]
     */
    for (var k in endpoints) {
        var endpoint = endpoints[k];

        // define dynamic endpoint only if it doesn't already exist
        if (this.list({
                topic: options.role,
                cmd: endpoint
            }).length === 0) {


            hemera.add({
                topic: options.role,
                cmd: endpoint,
                auth$: {
                    scope: [options.role + '_' + endpoint]
                },
            }, (req, done) => {

                var store = _.extend(req, {
                    topic: options.store,
                    cmd: req.cmd,
                    collection: options.collection
                });

                this.act(store, (err, resp) => {
                    return done(err, resp);
                })
            });

        }
    }

    /**
     * Provides an array of available commands
     */
    hemera.add({
        topic: options.role,
        cmd: "commands"
    }, (req, done) => {

        hemera.act({
          topic: 'stats',
          cmd: 'registeredActions',
        }, function (err, resp) {

            let scopes = []
            _.each(resp.actions, (action, key) => {
                if (action.plugin == 'hemera-entity-plugin') {
                    scopes.push(action.pattern.topic + '_' + action.pattern.cmd)
                }
            })

            return done(null, {
                result: scopes
            })
        })
    })

    next()
})

exports.options = {}

exports.attributes = {
    pkg: require('./package.json')
}
