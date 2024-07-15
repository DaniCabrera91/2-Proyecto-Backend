const express = require ('express')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000
const {dbConnection} = require('./config/config')
app.use(express.json())
const { typeError } = require('./middlewares/errors')
dbConnection()


app.use('/users', require('./routes/users'))
app.use('/posts', require('./routes/posts'))
app.use('/comments', require('./routes/comments'))


app.use(typeError)

app.listen(PORT, () => console.log(`Server started at port ${PORT}`))




