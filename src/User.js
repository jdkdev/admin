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
        return (async() => {
            this.id = id
            this.email = email
            this.password = password
            this.date_added = date_added
            this.site = site
            return this
        })()
    }
    static async create({email, password, site, date_added = new Date()}) {
        //validate data
        //make sure doesn't exist in system
        try {
            let usere = await User.findByEmail(email)
            console.log({usere})
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
            let id = this.run(sql, [email, hashedPassword, site, date_added])
            return User.find(id)
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
        let result = await db.run(sql, [email, site, date_added, id])
        let user = await User.findByID(result.lastInsertRowid)
        return user
    }

    static async findByID(id) {
        let response = super.find(id)
        return response !== null ? await new User(response) : response
    }
    static async findByEmail(email) {
        let response = this.where('email', [email]);
        console.log({response})
        return response !== null ? await new User(response) : response
    }
    async save() {
        if (this.id) {
            //update
            User.update(this)
        } else {
            return await User.create(this)
        }
    }
    async login() {
        let accessToken = this.generateAccessToken(ACCESS_TOKEN_SECRET)
        const refreshToken = this.generateAccessToken(REFRESH_TOKEN_SECRET)

        refreshTokens.push(refreshToken)
        return {accessToken, refreshToken}
    }
    async auth(pw) {
        var sql = 'SELECT password FROM users WHERE id = ?'
        let {password} = await db.get(sql, [this.id])
        if(await bcrypt.compare(pw, password)) return 'success'
        else return null
    }
    generateAccessToken(token, expiration='24h') {
        return jwt.sign({id: this.id, email: this.email, site: this.site}, token, { expiresIn: expiration })
    }
}

User.table = 'users'
User.fields = [
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
User.fillable = ['id', 'email', 'site', 'date_added']
User.guarded = ['password']

module.exports = User