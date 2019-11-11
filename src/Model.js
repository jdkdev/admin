const { env } = require('frontier')
const dbase = require('./connection')

class Model {
    static getFields() {
        let fields = (this.fillable || []).length  > 0 ? this.fillable : this.fields.map(field => field.name)
        return fields.filter(field => ! (this.guarded || []).includes(field))
    }
    static select() {
        console.log('inside sekect')
        return 'SELECT ' + this.getFields()
    }
    static all() {
        var sql = this.select() +  ' FROM ' + this.table 
        // var sql = 'SELECT * FROM ' + this.table 
        console.log({sql})
        return dbase.all(sql)
    }
    static get(field, params) {
        var sql = 'SELECT * FROM ' + this.table + ' WHERE ' + field + ' = ?' 
        return this.db.get(sql, params)
    }
    static where(field, params) {
        var sql = 'SELECT * FROM ' + this.table() + ' WHERE ' + field + ' = ?' 
        return dbase.get(sql, params)
    }
    static find(field, params) {
        return this.where('id', params)
    }
    async save() {
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
            let usere = User.findByEmail(email)
            console.log(usere)
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
            let id = db.run(sql, [email, hashedPassword, site, date_added])
            return User.findByID(id)
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
}
// Model.table = ''
// Model.fields = []
// Model.fillable = []
// Model.guarded = []

module.exports = Model