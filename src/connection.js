const { env } = require('frontier')

const sqlite3 = require('sqlite3')
const db = require('better-sqlite3')(env.get('DB'), { verbose: console.log })
// let db = new sqlite3.Database(env.get('DB'))

class Database {
    constructor(name = '') {
        this.name = name
    }
    all(sql) {
        let stmt = db.prepare(sql)
        return stmt.all()
    }
    get(sql, params) {
        let stmt = db.prepare(sql)
        return stmt.get(params) || null
    }
    async run(sql, params = []) {
            return db.run(sql, params)
    }
}

module.exports = new Database('authDB')