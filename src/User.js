const { env } = require('frontier')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
// const db = require('./connection')
const Model = require('./Model')

let refreshTokens = []
let REFRESH_TOKEN_SECRET = env.get('REFRESH_TOKEN_SECRET')
let ACCESS_TOKEN_SECRET= env.get('ACCESS_TOKEN_SECRET')

class User extends Model {
    constructor({id = null, email = '', password = '', date_added = new Date(), site = ''} = {}) {
        super()
            this.id = id
            this.email = email
            this.password = password
            this.date_added = date_added
            this.site = site
            return this
    }
    static get hidden() {
        return ['password']
    }
    static get fields() {
        return [
            {
                name: 'id',
                type: 'integer',
            },
            {
                name: 'email',
                type: 'string'
            },
            {
                name: 'password',
                type: 'string'
            },
            {
                name: 'site',
                type: 'string'
            },
            {
                name: 'date_added',
                type: 'timestamp'
            }
        ]
    }
    static async validateThenStore({email, password, site, date_added = new Date().toString()}) {
        //Need to validate data
        try {
            if (this.emailTaken(email)) return 'Email Taken'

            let hashedPassword = await bcrypt.hash(password, 10)
            let result = this.create({email, password: hashedPassword, site, date_added})
            return result
        } catch (e) {
            return console.log({e})
        }
    }
    static emailTaken(email) {
        if (this.where('email', email)) return true
    }
}

module.exports = User