const DB = require('./Database')

class Model {
    static get table() {
        return this.name.toLowerCase() + 's'
    }
    get table() { // if needed in instance
        return this.constructor.table
    }
    static get fields() {
        return []
    }
    static get visible() {
        return []
    }
    static get hidden() {
        return []
    }
    static get fillable() {
        return []
    }
    static get guarded() {
        return ['id']
    }
    _getVisibleFields() {
        let {fields, visible, hidden} = this.constructor

        visible = visible.length ? visible : fields.map(field => field.name)
        let fieldsArray = visible.filter(field => ! hidden.includes(field))
        return fieldsArray
    }
    _getFillableFields() {
        let {fillable, fields, guarded} = this.constructor
        fillable = fillable.length ? fillable : fields.map(field => field.name)
        let fieldsArray = fillable.filter(field => !guarded.includes(field))
        return fieldsArray
    }
    _getFillableParams() {
        let fillable = this._getFillableFields()
        let params = {}
        Object.keys(this).forEach(field => {
            if (fillable.includes(field)) params[field] = this[field]
        })
        return params
    }
    _getParameterizedFields() {
        let fillable = this._getFillableFields()
        // console.log({fields})
        let parameterized = fillable.map(field => '$' + field)
        // console.log({parameterized})
        return parameterized
    }

    _getFillableInsertQuery() {
        let sql = '(' + this._getFillableFields() + ')' +
        ' VALUES (' + this._getParameterizedFields() + ' )'
        return sql
    }
    _getFillableUpdateQuery() {
        fillable = this._getFillableFields()
        let sqlString = fillable.map(field => field + ' = $' + field + ' ')
        return sqlString
    }

    _qSelect() {
        let sqlSelect = 'SELECT ' + this._getVisibleFields()
        // console.log(sqlSelect)
        return sqlSelect
    }
    _qInsert() {
        let sqlInsert = 'INSERT INTO ' + this.table
        return sqlInsert
    }
    _qUpdate() {
        let sqlUpdate = 'UPDATE ' + this.table + ' SET '
        return sqlUpdate
    }

    _query() {
        let sqlPartial = this._qSelect() +  ' FROM ' + this.table 
        return sqlPartial
    }

    static all() {
        return (new this).all(...arguments)
    }
    all() {
        var sql = this._query()
        return DB.all(sql)
    }

    static where() {
        return (new this).where(...arguments)
    }
    where(field, params) {
        // console.log({field})
        var sql = this._query() + ' WHERE ' + field + ' = ?' 
        return DB.get(sql, params)
    }

    get(field, param) {
        return this.where(field, param)
    }

    static find() {
        return (new this).find(...arguments)
    }
    find(id) {
        return this.get('id', id)
    }

    static create(data) {
        let instance = new this(data)
        return instance.save()
    }

    save() {
        return this.id ? this._update() : this._insert()
    }

    _insert() {
        let params = this._getFillableParams()
        let sql = this._qInsert() + this._getFillableInsertQuery()
        let {changes, lastInsertRowid} = DB.run(sql, params)
        return this.find(lastInsertRowid)
    }

    _update(params) {
        let sql = this._qUpdate() + this._getFillableUpdateQuery(params)
        sql += ' WHERE id = $id'
        params['id'] = this.id
        let {changes, lastInsertRowid} = DB.run(sql, params)
        // return returnId ? lastInsertRowid : this.find(lastInsertRowid)
        return this.find(lastInsertRowid)
    }
}

module.exports = Model