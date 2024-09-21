const express = require ('express')
const cors = require('cors')
const app = express()
require('dotenv').config()

const PORT = process.env.PORT || 3001
const {dbConnection} = require('./config/config')
app.use(express.json())
const { typeError } = require('./middlewares/errors')

dbConnection()
app.use(cors())

app.use('/users', require('./routes/users'))
app.use('/posts', require('./routes/posts'))
app.use('/comments', require('./routes/comments'))


app.use(typeError)

app.listen(PORT, () => console.log(`Server started at port ${PORT}`))




