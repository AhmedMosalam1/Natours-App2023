class apifeatures {
    constructor(query, queryString) {
        this.query = query
        this.queryString = queryString
    }

    filter() {
        const queryobj = { ...this.queryString }
        const exclude = ['page', 'sort', 'limit', 'fields']
        exclude.forEach(el => delete queryobj[el])
        //advanced filtering
        let querystring = JSON.stringify(queryobj)
        querystring = querystring.replace(/\b(gte|gt|lte|le)\b/g, match => `$${match}`)
        this.query = this.query.find(JSON.parse(querystring))

        return this;
    }

    sort() {
        if (this.queryString.sort) {
            const sortby = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortby)
        } else {
            this.query = this.query.sort('-createdat')
        }

        return this;
    }

    limit() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ')
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v')
        }
        return this
    }

    paginate() {
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 100
        const skip = (page - 1) * limit

        this.query = this.query.skip(skip).limit(limit)

        return this;
    }

}



module.exports = apifeatures