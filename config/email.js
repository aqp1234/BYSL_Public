const nodemailer = require('nodemailer');

const smtpTransport = nodemailer.createTransport({
    service: 'Naver',
    host: 'smtp.naver.com',
    port: 587,
    auth: {
        user: 'email',
        pass: 'password',
    },
});

module.exports = {
    smtpTransport
};