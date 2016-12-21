#BBPOS - F&B Web POS

##[version:v2.2.0](http://59.152.251.6:3060/login.html)
> First release to QA after database structure

## 运行示例

- Node 版本：`v4.5.0`
- npm  版本：`v2.15.9`
- gulp 版本：`v3.9.1`

> * git命令 cd 到`bbpos_fb_web`文件夹目录下
> * 运行 gulp 命令
> * 运行 npm start 命令

## 项目结构

```
bbpos_fb_web
├── README.md
├── app.js
├── bin
│   └── www
├── controllers
│   ├── attachment
│   ├── common
│   ├── item
│   ├── layout
│   ├── login
│   ├── order
│   ├── setting
│   ├── socket
│   └── couchbaseDB.js
├── public
│   ├── build
│   ├── css
│   ├── img
│   ├── js
│   ├── libs
│   ├── tpl
│   ├── config.json
│   ├── config_demo.json
│   └── config_qa.json
├── routes
│   └── config.js
├── gulpfile.js
├── package.json
└── .gitignore
```

其中，`/bin/www` 是 启动文件，`/public/config.js` 配置了启动服务监听的端口号。

`/public/config.js` 文件包含如下配置项：

```json
{
   "serverPort" : "系统端口号",

   "serverIP" : "服务器地址",
   "bucketName" : "CouchBase -> bucket",
   "gatewayPort" : "网关端口",
   "gatewayAuth" : "网关认证名称",
   "operationTimeout" : "CouchBase操作时间",

   "socketPort" : "推送服务端口号",
   "socketIP" : "推送服务地址"
}
```