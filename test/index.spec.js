'use strict'
var JWTSECRET = process.env.JWTSECRET || false

const Hemera = require('nats-hemera')
const Code = require('code')
const plugin = require('../index.js')
const HemeraTestsuite = require('hemera-testsuite')
const ActStub = require('hemera-testsuite/actStub')
const addStub = require('hemera-testsuite/addStub')
const hemeraMongo = require('hemera-mongo-store')
const jwt = require('jsonwebtoken')
const NATS = require('nats')
const _ = require('lodash')

var servers = ['nats://localhost:4222'];

// assert library
const expect = Code.expect

// prevent warning message of too much listeners
process.setMaxListeners(0)

var defaultOptions = require('../default-options.json')
var options = _.defaultsDeep(options, defaultOptions)

describe('hemera-account', function() {

    var jwtToken = jwt.sign({ scope: ['entitytest_create', 'entitytest_remove'] }, JWTSECRET);

    // integration test
    it('create row', function(done) {

        // connect to nats
        var nats = NATS.connect({
            'servers': servers
        });

        const hemera = new Hemera(nats, {
            logLevel: 'info'
        })

        hemera.use(hemeraMongo, {
            mongo: {
                url: 'mongodb://localhost:27017/tests'
            },
            store: {
                update: {
                    upsert: true
                }
            }
        })

        const actStub = new ActStub(hemera)

        hemera.use(plugin, {
            role: 'entitytest',
            collection: 'entitytests'
        })

        hemera.ready(() => {

            // call add and expect mongo id back
            hemera.act({
                meta$: {
                    jwtToken
                },
                topic: "entitytest",
                cmd: "create",
                data : {"test_value":1}
            }, (err, res) => {

                expect(err).not.to.be.exists()
                expect(res._id).to.be.exists()

                hemera.log.debug("Removing data")
                // remove the data
                hemera.act({
                    meta$: {
                        jwtToken
                    },
                    topic: 'entitytest',
                    cmd: 'remove',
                    collection: 'entitytests',
                    query: {}
                }, (err, resp) => {
                    hemera.close()
                    done()
                })
            })
        })

    })

})
