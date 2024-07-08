const nodemailer = require('nodemailer')
const { credentials } = require('./config.json')['development']

let transporter = nodemailer.createTransport({
 host: 'smtp.gmail.com',
 port: 465,
 secure: true,
 auth: credentials,
})
module.exports = transporter