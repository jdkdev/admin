const { env } = require('frontier')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const db = require('./connection')

let refreshTokens = []
let REFRESH_TOKEN_SECRET = env.get('REFRESH_TOKEN_SECRET')
let ACCESS_TOKEN_SECRET= env.get('ACCESS_TOKEN_SECRET')

class User {
    constructor({id = null, email = '', password = '', date_added = new Date(), site = ''} = {}) {
        return (async() => {
            this.id = id
            this.email = email
            this.password = password
            this.date_added = date_added
            this.site = site
            return this
        })()
    }
    async save() {
        console.log('inside save', {user: this})
        if (this.id) {
            //update
            User.update(this)
        } else {
            return await User.create(this)
        }
    }
    static async create({email, password, site, date_added = new Date()}) {
        //validate data
        //make sure doesn't exist in system
        try {
            let usere = await User.findByEmail(email)
            if (usere) {
                //TODO: how do I make this error out
                return {'message' : 'Email taken'}
            }
        } catch (e) {
            return new Error(e)
        }
        try {
            let hashedPassword = await bcrypt.hash(password, 10)
            var sql = 'INSERT INTO users(email, password, site, date_added) VALUES (?, ?, ?, ?)'
            // let id = await User._run(sql, [email, hashedPassword, site, date_added])
            let id = await db.run(sql, [email, hashedPassword, site, date_added])
            return await User.findByID(id)
        } catch (e) {
            return new Error(e)
        }
    }
    static async update({id, email, site, date_added}) {
        //Better email validations
        let user = await User.findByEmail(email)
        if (user) {
            return {message: 'Email taken'}
        }
        var sql = 'UPDATE users SET email=?, site=?, date_added=?) WHERE id = ?'
        let resultId = await db.run(sql, [email, site, date_added, id])
        let user = await User.findByID(resultId)
        return user
    }

    async auth(pw) {
        var sql = 'SELECT password FROM users WHERE id = ?'
        let {password} = await db.get(sql, [this.id])
        if(await bcrypt.compare(pw, password)) return 'success'
        else return null
    }
    static async findByID(id) {
        var sql = 'SELECT id, email, site, date_added FROM users WHERE id = ?'
        let response = await db.get(sql, [id])
        return response !== null ? await new User(response) : response
    }
    static async findByEmail(email) {
        var sql = 'SELECT id, email, site, date_added FROM users WHERE email = ?'
        let response = await db.get(sql, [email])
        return response !== null ? await new User(response) : response
    }
    async login() {
        let accessToken = this.generateAccessToken(ACCESS_TOKEN_SECRET)
        const refreshToken = this.generateAccessToken(REFRESH_TOKEN_SECRET)

        refreshTokens.push(refreshToken)
        return {accessToken, refreshToken}
    }
    generateAccessToken(token, expiration='24h') {
        return jwt.sign({id: this.id, email: this.email, site: this.site}, token, { expiresIn: expiration })
    }
}

module.exports = User