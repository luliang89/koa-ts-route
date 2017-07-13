'use strict';

import pathToRegexp = require('path-to-regexp');


export enum HttpMethod {
    GET = 1,
    POST,
    PUT,
    DELETE,
    HEAD,
    OPTIONS
}

export const httpMethodNames = [
    'get',
    'post',
    'put',
    'delete',
    'head',
    'options'
]

/**
 * 路由信息
 */
export class RouteContext {

    /**
     * 路由路径
     */
    private path: string;

    private _pathRegExp?: pathToRegexp.PathRegExp;

    private keys?: string[];

    constructor(
        private controller: Function,
        public prefix?: string,
        private httpMethod?: HttpMethod,
        private actionName?: string,
        private actionAlias?: string,
        private pathParams?: string
    ) {

    }

    private get pathRegExp() {
        if (!this._pathRegExp) {
            this.path = this.create();
            if (this.pathParams) {
                let _keys: any[] = [];
                this._pathRegExp = pathToRegexp(this.path, _keys);
                this.keys = _keys;
            }
        }
        return this._pathRegExp;
    }

    private getAction() {
        let name = this.actionAlias ? this.actionAlias : this.actionName;
        if (!name) {
            return null;
        }
        if (httpMethodNames.indexOf(name) > -1) {
            return null;
        }
        return name;
    }

    /**
     * 生成路径
     * @return {string} 路径
     */
    private create() {
        let path = '/' + this.controller.name.replace(/(Handler|Controller)$/, '')
            .match(/[A-Z]+[a-z0-9]+/g).join('-').toLowerCase();
        let action = this.getAction();
        if (action) {
            path += '/' + action.match(/[a-z0-9]+|[A-Z]+[a-z0-9]+/g).join('-').toLowerCase();
        }
        if (this.pathParams) {
            path += this.pathParams;
        }
        if (this.prefix) {
            path = this.prefix + path;
        }
        return path;
    }

    /**
     * 解析pathParams
     * @param {string} path ctx.path
     * @return {Map<string, string>} 解析结果key:value
     */
    private parse(path: string): any {
        if (!this.pathRegExp || !this.pathRegExp.test(path)) {
            return null;
        }
        let arr = this.pathRegExp.exec(path);
        if (arr.length === 0) {
            return null;
        }
        let map: any = {};
        this.keys.map((key: any, i) => {
            map[key.name] = arr[i + 1];
        });
        return map;
    }

    /**
     * 匹配
     * @param {string} path ctx.path
     * @param {string} method ctx.method 
     * @return {boolean} 是否匹配
     */
    match(path: string, method: string) {
        if (this.httpMethod && HttpMethod[this.httpMethod] !== method.toUpperCase()) {
            return false;
        }
        if (!this.pathRegExp) {
            return path === this.path;
        }
        return this.pathRegExp.test(path);
    }

    build(path: string): IRoute {
        let params = this.parse(path);
        return {
            controller: this.controller,
            action: this.actionName,
            data: params
        };
    }
}

export interface IRoute {

    controller: any

    action: string

    data: any
}