const { env } = require('frontier')
const jwt = require('jsonwebtoken')

let ACCESS_TOKEN_SECRET= env.get('ACCESS_TOKEN_SECRET')
let REFRESH_TOKEN_SECRET = env.get('REFRESH_TOKEN_SECRET')
let User = require('./User')

//fix
let refreshTokens = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJiJDEwJEJJQVVLRmJCakk2dGxHQVFxVTNHNnViQUNLS2tTZWkyUGNxRlZESE1acmU2VEJtekUwOGpTIiwiaWF0IjoxNTcyNzIzMzM2fQ.H94OYXkcQKEsaYP4m549g47ch5VfJA_1v2RtU-_JsMs'
]
const UserController = {
    index(req, res) {
        let users = User.all()
        return res.json(users)
    },
    async store(req, res) {
        let user = { email, password, site } = req.body
        res.status(201).send(await User.validateThenStore(user))
    },

    logout(req, res) {
        //reqork this into DB
        refreshTokens = refreshTokens.filter(token => token !== req.body.token)
        res.sendStatus(204)
    },
    // Middleware Testing
    authenticateTokenMiddleware(req, res, next) {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]
        if (token == null) return res.sendStatus(401)

        jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) return res.sendStatus(403)
            req.user = user
            next()
        })
    },
}
module.exports = UserController