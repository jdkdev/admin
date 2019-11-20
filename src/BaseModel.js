//Maybe use this class
class BaseModel {
    get self() {
        return this.constructor
    }
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

        fields = (visible || []).length  > 0 ? visible : fields.map(field => field.name)
        let sqlString = fields.filter(field => ! (hidden || []).includes(field))
        // console.log({sqlString})
        return sqlString
    }
    _getFillableFields() {
        let {fillable, fields, guarded} = this.self

        fields = (fillable || []).length  > 0 ? fillable : fields.map(field => field.name)

        let sqlString = fields.filter(field => !guarded.includes(field))
        // console.log({sqlString})
        return sqlString
    }
    _getParameterizedFields(fields) {
        fields = this._getFillableFields(fields)
        // console.log({fields})
        let parameterized = fields.map(field => '$' + field)
        // console.log({parameterized})
        return parameterized
    }

    _getFillableInsertQuery() {
        let sql = '(' + this._getFillableFields()
        sql += ') VALUES ('
        sql += this._getParameterizedFields()
        sql += ' )'
        return sql
    }
    _getFillableUpdateQuery() {
        fields = this._getFillableFields()
        let sqlString = fields.map(field => {
            let newField = field + ' = $' + field + ' '
            return newField
        })
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
}

module.exports = BaseModel