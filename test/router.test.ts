'use strict';

import assert = require('assert');

import { Router } from '../src/router';

var router = new Router();

@router.route()
class GoodsController {

    context:any

    get() {
        throw 'get';
    }

}

@router.route('/api')
class OrderController {

    context:any

    get() {
        throw 'get';
    }

}

class OrderItemController {

    context:any

    @router.get(null, 'name')
    getByName1() {
        throw 'getByName';
    }

    @router.get('/:id')
    query() {
        throw 'query';
    }

}

@router.route('/api')
class SystemParamsController {

    context:any

    get() {
        throw 'get';
    }

    @router.get('/:id')
    query() {
        throw 'query';
    }
}

describe('Router', function () {

    var ctx: any;

    var next = async () => { }

    beforeEach(function () {
        ctx = {
            state: {},
            redirect: function (url: string) {
                throw 'redirect';
            },
            throw: function (status: number) {
                throw status;
            }
        };

    });

    describe('route', function () {

        it('get', function (done) {
            ctx.path = '/goods';
            ctx.method = 'GET';
            router.run()(ctx, next);
            router.execute()(ctx, null).catch(e => {
                assert.equal(e, 'get');
                done();
            });
        });

        it('get prefix', function (done) {
            ctx.path = '/api/order';
            ctx.method = 'GET';
            router.run()(ctx, next);
            router.execute()(ctx, null).catch(e => {
                assert.equal(e, 'get');
                done();
            });
        });

    });

    describe('http', function () {

        it('get alias', function (done) {
            ctx.path = '/order-item/name';
            ctx.method = 'GET';
            router.run()(ctx, next);
            router.execute()(ctx, null).catch(e => {
                assert.equal(e, 'getByName');
                done();
            });
        });

        it('get pathParams', function (done) {
            ctx.path = '/order-item/query/5';
            ctx.method = 'GET';
            router.run()(ctx, next);
            router.execute()(ctx, null).catch(e => {
                assert.equal(e, 'query');
                assert.equal(ctx.state.route.data.id, '5');
                done();
            });
        });

    });

    describe('cross', function () {

        it('get', function (done) {
            ctx.path = '/api/system-params';
            ctx.method = 'GET';
            router.run()(ctx, next);
            router.execute()(ctx, null).catch(e => {
                assert.equal(e, 'get');
                done();
            });
        });

        it('get /:id', function (done) {
            ctx.path = '/api/system-params/query/7';
            ctx.method = 'GET';
            router.run()(ctx, next); router.execute()(ctx, null).catch(e => {
                assert.equal(e, 'query');
                assert.equal(ctx.state.route.data.id, '7');
                done();
            });
        });

    });

});