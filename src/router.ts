'use strict';

import Koa = require('koa');

import { RouteContext, IRoute, HttpMethod, httpMethodNames } from './routeContext';

declare module 'koa' {

    class Application {
        route: IRoute
    }

}

export interface IController {

    context: Koa.Context

    initialize?(): Promise<void>

    dispose?(): Promise<void>
}


export interface IControllerConstructor {

    new(): IController

}



/**
 * 路由组件
 */
export class Router {

    private routes = new Set<RouteContext>();

    /**
     * 带PathParams
     */
    private routes2 = new Set<RouteContext>();

    private classRoutesMap = new Map<Function, Set<RouteContext>>();

    /**
     * 控制器标识
     * 类装饰器，以类名为path，类方法get、post、put、delete对应http method
     */
    route(prefix?: string) {
        var _this = this;
        return function (constructor: IControllerConstructor) {
            let route = new RouteContext(constructor, prefix);
            if (_this.routes.has(route)) {
                throw 'the route is created';
            }
            _this.routes.add(route);
            if (prefix) {
                let routes = _this.classRoutesMap.get(constructor);
                if (routes) {
                    for (let r of routes) {
                        r.prefix = prefix;
                    }
                }
            }
            _this.classRoutesMap.delete(constructor);
        }
    }

    /**
     * 标识为http api
     * 方法装饰器，仅能使用在原型方法上；
     * 如果有方法与Http Method同名，请使用@handler标识类，如无pathParams，无需使用该标识；
     * @param {string} pathParams 路径参数
     * @param {HttpMethod} method http方法
     * @param {string} alias 别名
     */
    http(pathParams: string, method?: HttpMethod, alias?: string) {
        var _this = this;
        return function (target: IController, key: string, descriptor: TypedPropertyDescriptor<Function>) {
            //不支持静态方法
            if (typeof target === 'function') {
                throw 'not support method';
            }
            let idx = httpMethodNames.indexOf(key);
            if (idx > -1) {
                //如果方法名为http method之一时，pathParams必须有值，否则使用@route
                if (!pathParams) {
                    throw 'pathParams is null or undefined';
                }
                method = idx + 1;
            } else {
                //如果方法名不为http method之一时，必须指定Http Method
                if (!method) {
                    throw 'method is null or undefined';
                }
            }
            let constructor = target.constructor;
            let route = new RouteContext(constructor, null, method, key, alias, pathParams);
            if (pathParams) {
                if (_this.routes2.has(route)) {
                    throw 'the route is created';
                }
                _this.routes2.add(route);
            } else {
                if (_this.routes.has(route)) {
                    throw 'the route is created';
                }
                _this.routes.add(route);
            }
            let routes = _this.classRoutesMap.get(constructor);
            if (!routes) {
                routes = new Set<RouteContext>();
                _this.classRoutesMap.set(constructor, routes);
            }
            routes.add(route);
        }
    }

    /**
     * 标识为http get api
     */
    get(pathParams?: string, alias?: string) {
        return this.http(pathParams, HttpMethod.GET, alias);
    }

    /**
     * 标识为http post api
     */
    post(pathParams?: string, alias?: string) {
        return this.http(pathParams, HttpMethod.POST, alias);
    }

    /**
     * 标识为http put api
     */
    put(pathParams?: string, alias?: string) {
        return this.http(pathParams, HttpMethod.PUT, alias);
    }

    /**
     * 标识为http delete api
     */
    delete(pathParams?: string, alias?: string) {
        return this.http(pathParams, HttpMethod.DELETE, alias);
    }

    /**
     * 路由匹配
     */
    private match(path: string, method: string): RouteContext {

        for (let route of this.routes) {
            if (route.match(path, method)) {
                return route;
            }
        }

        for (let route of this.routes2) {
            if (route.match(path, method)) {
                return route;
            }
        }

        return null;
    }

    run() {
        var _this = this;

        return async function (context: Koa.Context, next: () => Promise<void>) {
            let routeContext = _this.match(context.path, context.method);
            if (routeContext === null) {
                context.throw(404);
            }

            let route = routeContext.build(context.path);
            context.state.route = route;

            if (!route.action) {
                route.action = context.method.toLowerCase();
                let property = route.controller.prototype[route.action];
                if (!property || typeof property !== 'function') {
                    context.throw(404);
                }
            }

            await next();

            if (context.request.fresh) {
                context.status = 304;
            }
        }
    }

    /**
     * new controller and call action
     * @param ctx 
     * @param next 
     */
    execute() {
        var _this = this;

        return async function (context: Koa.Context, next: () => Promise<void>) {
            let route = context.state.route;
            let ctrl: IController = new route.controller();
            ctrl.context = context;
            try {
                //初始化
                if (typeof ctrl.initialize === 'function') {
                    await ctrl.initialize();
                }
                let result = await (<any>ctrl)[route.action]();
                if (result !== undefined || result !== null) {
                    context.body = result;
                } else {
                    if (context.body === undefined || context.body === null) {
                        context.status = 204;
                    }
                }
            } finally {
                //销毁
                if (typeof ctrl.dispose === 'function') {
                    try {
                        await ctrl.dispose();
                    } catch (e) {
                    }
                }
            }
        }
    }

}
