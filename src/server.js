const { env } = require('frontier')
const helmet = require('helmet')

let server = require('express')()
let port = env.get('PORT') || 3131;
let router = require('./router')

server.use(helmet())
server.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))

server.use('/api/v1', router)
server.listen(port, () => console.log(`Auth Server listening on port ${port}!`))