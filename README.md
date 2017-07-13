# Koa-ts-route

koa-ts-route是基于Koa2实现的路由库，使用TypeScript编写。

## 特点 Features

- 注解
- 完全异步实现
- 支持URL格式参数

## 安装 Install

```
$ npm install koa-ts-route
```

## 快速开始 Quick Start

### 初始化 Initialization

```js
//app.ts

import Koa = require('koa');
import { Router, IRoute } from 'koa-ts-route';

export var koa = new Koa();
export var router = new Router();

//other koa middleware....

//start route
koa.use(router.run());

//other koa middleware....

//last middleware:business code
koa.use(router.execute());

```

### 创建控制器 Create Controller

```js
//user.controller.ts

import { router } from './app';

@router.route()
export class UserController{
	
    get(){
    	return 'get';
    }
    
    post(){
    	return 'post';
    }
    
    put(){
    	return 'put';
    }
    
    delete(){
    	return 'delete';
    }
    
}
```

### 启动 Start

```js
//index.ts

import { koa } from './app';

import 'user.controller';

koa.listen(3000);

```

GET http://localhost:3000/user -> get

POST http://localhost:3000/user -> post

....

## URL格式参数 URL Format Parameter

```js
@router.get('/:redirect+')
login(){
	//this.context is Koa.Context
	return this.context.state.route.data.redirect;
}
```
GET http://localhost:3000/user/login/order/detail/1 -> order/detail/1

## async await

```js
@router.put()
async setPayPassword(){
	await this.func();
    //reuturn number is http statusCode
	return 200;
}

private async func(){
	...
}
```

PUT http://localhost:3000/user/set-pay-password -> ok

## 控制器事件 Controller Event

```js
async initialize(){
	//open connection...
}

async dispose(){
	//clean,close connection...
}
```

## License

  MIT