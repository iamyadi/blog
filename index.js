// 启用alias
// require('module-alias/register')
const path = require('path')
const Koa = require('koa')
const app = new Koa()
const route = require('./src/middleware/router').router
// 路由
app.use(route)

app.listen('3000')

