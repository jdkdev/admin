// const { env } = require('frontier')
const DB = require('./Database')

class Model {
    /**
     * Use defined visible and hidden fields on Model to create field list
     */
    static _getVisibleFields() {
        let fields = (this.visible || []).length  > 0 ? this.visible : this.fields.map(field => field.name)
        let sqlString = fields.filter(field => ! (this.hidden || []).includes(field))
        // console.log({sqlString})
        return sqlString
    }
    static _getFillableFields(fields) {
        if (fields) {
            fields = Object.keys(fields)
        } else {
            fields = (this.fillable || []).length  > 0 ? this.fillable : this.fields.map(field => field.name)
        }

        let sqlString = fields.filter(field => ! (this.guarded || Model.guarded).includes(field))
        console.log({sqlString})
        return sqlString
    }
    static _getParameterizedFields(fields) {
        fields = this._getFillableFields(fields)
        console.log({fields})
        let parameterized = fields.map(field => '$' + field)
        // console.log({parameterized})
        return parameterized
    }

    static _getFillableInsertQuery(params) {
        let sql = '(' + this._getFillableFields(params)
        sql += ') VALUES ('
        sql += this._getParameterizedFields(params)
        sql += ' )'
        return sql
    }
    static _getFillableUpdateQuery(fields) {
        fields = this._getFillableFields(fields)
        let sqlString = fields.map(field => {
            let newField = field + ' = $' + field + ' '
            return newField
        })
        return sqlString
    }

    static _qSelect() {
        let sqlSelect = 'SELECT ' + this._getVisibleFields()
        // console.log(sqlSelect)
        return sqlSelect
    }
    static _qInsert() {
        let sqlInsert = 'INSERT INTO ' + this.table
        return sqlInsert
    }
    static _qUpdate() {
        let sqlUpdate = 'UPDATE ' + this.table + ' SET '
        // let sql = 'UPDATE ' + this.table + 'SET ('
        return sqlUpdate
    }

    static _query() {
        let sqlPartial = this._qSelect() +  ' FROM ' + this.table 
        return sqlPartial
    }

    static all() {
        var sql = this._query()
        return DB.all(sql)
    }


    static where(field, params) {
        var sql = this._query() + ' WHERE ' + field + ' = ?' 
        return DB.get(sql, params)
    }

    static get(field, param) {
        return this.where(field, param)
    }

    static find(id) {
        return this.get('id', id)
    }


    static create(data) {
        return this.id ? this._update(data) : this._insert(data)
    }
    save() {
        return this.id ? Model._update(this) : Model._insert(this)
    }

    static _insert(params) {
        let sql = Model._qInsert() + Model._getFillableInsertQuery(params)
        console.log({sql})
        let {changes, lastInsertRowid} = DB.run(sql, params)
        // return returnId ? lastInsertRowid : this.find(lastInsertRowid)
        return Model.find(lastInsertRowid)
    }

    static _update(params) {
        let sql = this._qUpdate() + this._getFillableUpdateQuery(params)
        sql += ' WHERE id = $id'
        params['id'] = this.id
        let {changes, lastInsertRowid} = DB.run(sql, params)
        // return returnId ? lastInsertRowid : this.find(lastInsertRowid)
        return this.find(lastInsertRowid)
    }
}
// Model.table = ''
// Model.fields = []
// Model.fillable = []
Model.guarded = ['id']
// Model.visible = []
 // Model.hidden = ['password']

module.exports = Model