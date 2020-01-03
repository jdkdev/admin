const { env } = require('frontier')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const db = require('./connection')
const Model = require('frontier-backend/Model')

let refreshTokens = []
let REFRESH_TOKEN_SECRET = env.get('REFRESH_TOKEN_SECRET')
let ACCESS_TOKEN_SECRET= env.get('ACCESS_TOKEN_SECRET')

class User extends Model {
    constructor({id = null, email = '', password = '', date_added = new Date().toJSON(), site = ''} = {}) {
        super()
        this.id = id
        this.email = email
        this.password = password
        this.date_added = date_added
        this.site = site
        return this
    }
    static get useSoftDeletes() {
        return true
    }
    static get hidden() {
        return ['password']
    }
    static get guarded() {
        return ['is_deleted', 'date_added']
    }
    static get fields() {
        return [
            { name: 'id', type: 'integer', },
            { name: 'email', type: 'string' },
            { name: 'password', type: 'string' },
            { name: 'site', type: 'string' },
            { name: 'date_added', type: 'timestamp' },
            { name: 'is_deleted', type: 'timestamp' }
        ]
    }
    static findByEmail(email) {
        let instance = this.getWhere('email', email)
        console.log({instance})
        return new this(instance)
    }
    static async validateThenStore({email, password, site}) {
        //Need to validate data
        try {
            if (this.emailTaken(email)) return {error: 'Email Taken'}

            let hashedPassword = await bcrypt.hash(password, 10)
            let result = this.create({email, password: hashedPassword, site})
            console.log(result)
            return result
        } catch (e) {
            return console.log({e})
        }
    }
    static emailTaken(email) {
        if (this.getWhere('email', email)) return true
    }

    async auth(pw) {
        let sql = 'SELECT password FROM users where id = $id'
        let {password} = this.raw(sql, {id: this.id})
        console.log({password})
        if (await bcrypt.compare(pw, password)) return 'success'
        else return null
    }
    login() {
        let accessToken = this.generateAccessToken(ACCESS_TOKEN_SECRET)
        let refreshToken = this.generateAccessToken(REFRESH_TOKEN_SECRET)

        refreshTokens.push(refreshToken)
        return {accessToken, refreshToken}
    }
    generateAccessToken(token, expiration='24h') {
        return jwt.sign({id: this.id, email: this.email, site: this.site}, token, { expiresIn: expiration })
    }
}

module.exports = User