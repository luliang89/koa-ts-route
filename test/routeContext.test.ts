'use strict';

import assert = require('assert');

import { RouteContext } from '../src/routeContext';


class GoodsController {

}


describe('RouteContext', function () {

    describe('match', function () {

        it('controller action', function (done) {
            var routeContext = new RouteContext(GoodsController, null, null, 'list');
            var success = routeContext.match('/goods/list', 'GET');
            assert.equal(success, true);
            done();
        });

        it('controller prefix action', function (done) {
            var routeContext = new RouteContext(GoodsController, '/api', null, 'list');
            var success = routeContext.match('/api/goods/list', 'GET');
            assert.equal(success, true);
            done();
        });

        it('controller prefix action actionAlias', function (done) {
            var routeContext = new RouteContext(GoodsController, '/api', null, 'list', 'get-list');
            var success = routeContext.match('/api/goods/get-list', 'GET');
            assert.equal(success, true);
            done();
        });

        it('path-to-regexp one', function (done) {
            var routeContext = new RouteContext(GoodsController, '/api', null, 'list', 'get-list', '/:id');
            var success = routeContext.match('/api/goods/get-list/12', 'GET');
            assert.equal(success, true);
            done();
        });

        it('path-to-regexp many', function (done) {
            var routeContext = new RouteContext(GoodsController, '/api', null, 'list', 'get-list', '/:year/:month/:day');
            var success = routeContext.match('/api/goods/get-list/2012/02/23', 'GET');
            assert.equal(success, true);
            done();
        });


    });

    describe('build', function () {

        it('path-to-regexp one', function (done) {
            var routeContext = new RouteContext(GoodsController, '/api', null, 'list', 'get-list', '/:id');
            var route = routeContext.build('/api/goods/get-list/12');
            assert.equal(route.data.id, '12');
            done();
        });

        it('path-to-regexp many', function (done) {
            var routeContext = new RouteContext(GoodsController, '/api', null, 'list', 'get-list', '/:year/:month/:day');
            var route = routeContext.build('/api/goods/get-list/2012/02/23');
            let data = route.data;
            let success = data.year == '2012' && data.month == '02' && data.day == '23';
            assert.equal(success, true);
            done();
        });

    });

});