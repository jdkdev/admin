const { env } = require('frontier')
const jwt = require('jsonwebtoken')

let ACCESS_TOKEN_SECRET= env.get('ACCESS_TOKEN_SECRET')
let REFRESH_TOKEN_SECRET = env.get('REFRESH_TOKEN_SECRET')
let User = require('./User')

//fix
let refreshTokens = [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJ0ZXN0QGVtYWlsLmNvbSIsInBhc3N3b3JkIjoiJDJiJDEwJEJJQVVLRmJCakk2dGxHQVFxVTNHNnViQUNLS2tTZWkyUGNxRlZESE1acmU2VEJtekUwOGpTIiwiaWF0IjoxNTcyNzIzMzM2fQ.H94OYXkcQKEsaYP4m549g47ch5VfJA_1v2RtU-_JsMs'
]
const AuthController = {
    async register(req, res) {
        // console.log({req})
        //validate request
        try {
            let user = {
                email: req.body.email,
                password: req.body.password,
                site: req.body.site
            }
            res.status(201).send(await User.store(user))
            // let newUser = await new User(user)
            // let result = await newUser.save()
            // let me = await User.findByID(22)
            // console.log(me)
            // me.email = 'j@j.com'
            // await me.save()
        } catch (e) {
            console.log('error', e)
            res.status(500).send()
        }
    },
    async login(req, res) {
        let email = req.body.email;
        let password = req.body.password;
        let user
        try {
            user = await User.findByEmail(email)
        } catch (e) {
            console.log({e})
            res.status(500).send()
        }

        try {
            if (await user.auth(password)) {
                let {accessToken, refreshToken} = await user.login()
                refreshTokens.push(refreshToken)
                res.json({ accessToken: accessToken, refreshToken: refreshToken })
            } else {
                return res.json({message: 'Not allowed'})
            }
        } catch (e) {
            console.log(e)
            return res.json({message: 'You are not registered!'})
        }
    },

    refresh(req, res) {
        const refreshToken = req.body.token
        if (refreshToken == null) return res.sendStatus(401)
        if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)

        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, userData) => {
            if (err) return res.sendStatus(403)
            let user = await User.findByID(userData.id)
            const {accessToken} = await user.login()
            res.json({accessToken})
        })
    },

    async verify(req, res) {
        res.json({message: 'Valid Token', user: req.user})
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
module.exports = AuthController