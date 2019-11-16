const { env } = require('frontier')
const helmet = require('helmet')
const cors = require('cors')

let server = require('express')()
let port = env.get('PORT') || 3000;
let router = require('./router')

server.use(helmet())
server.use(cors())
server.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }))

server.use('/api/v1', router)
server.listen(port, () => console.log(`Admin Server listening on port ${port}!`))