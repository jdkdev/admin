const connection = require('./connection')

/**
 * The Datbase class hands the connection 
 * as well as a layer of abstraction for preparing statements
 * #run() - created
 * #get() - created
 * #all() - created
 * #iterate()
 * #pluck()
 * #expand()
 * #raw()
 * #columns()
 * #bind()
 */
class Database {
    constructor(name = 'Default', connection) {
        this.name = name
        this.db = connection
    }
    ex(cmd, sql, params = []) {
        console.log({sql, params})
        let stmt = this.db.prepare(sql)
        let result = stmt[cmd](params)
        return result
    }
    all(sql) {
        return this.ex('all', sql)
    }
    get(sql, params) {
        return this.ex('get', sql, params)
    }
    run(sql, params) {
        return this.ex('run', sql, params)
    }
}

module.exports = new Database('authDB', connection)