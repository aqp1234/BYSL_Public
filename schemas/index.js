const mongoose = require('mongoose');

const { MONGO_ID, MONGO_PASSWORD } = process.env;

const connect = () =>{
    if(process.env.NODE_ENV !== 'production'){
        mongoose.set('debug', true);
    }
    mongoose.connect(`mongodb://${MONGO_ID}:${MONGO_PASSWORD}@localhost:27017/admin`, {
        dbName: 'NCT',
        useNewUrlParser: true,
        useCreateIndex: true,
    }, (err) => {
        if(err){
            console.log('몽고디비 연결 에러', err);
        } else {
            console.log('몽고디비 연결 성공');
        }
    });
};

mongoose.connection.on('error', (err) => {
    console.error('몽고디비 연결 에러', err);
});

mongoose.connection.on('disconnected', () => {
    console.error('몽고디비 연결 종료, 재연결 시도');
    connect();
});

module.exports = connect;