'use strict'
var JWTSECRET = process.env.JWTSECRET || false

const Hp = require('hemera-plugin');
const _ = require('lodash');
const jwt = require('hemera-jwt-auth')

var endpoints = ["create", "update", "updateById", "find", "findById", "remove", "removeById", "replace", "replaceById", "exists"];

exports.plugin = Hp(function hemeraEntity(options, next) {

    const hemera = this

    var default_options = require('./default-options.json')
    options = _.defaultsDeep(options, default_options);

    hemera.use(jwt, {
        enforceAuth: false, // set to false if you want to enable it selectively
        jwt: {
            secret: JWTSECRET
        }
    })

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
        if (err) return done(err, null)

        return done(null, {
            result: endpoints
        })
    })

    next()
})

exports.options = {}

exports.attributes = {
    pkg: require('./package.json')
}
