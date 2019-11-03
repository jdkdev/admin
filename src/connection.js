const { env } = require('frontier')

const sqlite3 = require('sqlite3')
let db = new sqlite3.Database(env.get('DB'))

class Database {
    constructor(name = '') {
        this.name = name
    }
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.get(sql, params, (err, result) => {
                if (err) {
                    console.log('Error running sql: ' + sql)
                    reject(err)
                } else {
                    result = result === undefined ? null : result
                    resolve(result)
                }
            })
        })
    }
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            db.run(sql, params, function (err, result) {
                if (err) {
                    console.log('Error running sql: ' + sql)
                    reject(err)
                } else {
                    resolve(this.lastID)
                }
            })
        })
    }
}

module.exports = new Database('authDB')