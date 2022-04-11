const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');


dotenv.config();
const webSocket = require('./socket');
//라우트 정의 ex) const pageRouter = require(./routes/page)
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const roomRouter = require('./routes/room');
const chatRouter = require('./routes/chat');
const workspaceRouter = require('./routes/workspace');
const solo_workspaceRouter = require('./routes/solo_workspace');
const conferenceRouter = require('./routes/conference');
const calendarRouter = require('./routes/calendar');
const solo_calendarRouter = require('./routes/solo_calendar');
const shareRouter = require('./routes/share');
const dashboardRouter = require('./routes/dashboard');
const profileRouter = require('./routes/profile');
const staffRouter = require('./routes/staff');
const studentbookRouter = require('./routes/studentbook');
const staffinviteRouter = require('./routes/staffinvite');
const coverletterRouter = require('./routes/coverletter');
const settingsRouter = require('./routes/settings');

const { sequelize } = require('./models');
const connect = require('./schemas');
const passportConfig = require('./passport');


const schoolrecord_router=require('./routes/school_record');
const self_introduce_router=require('./routes/self_introduce');
const app = express();
passportConfig();
app.set('port', process.env.PORT || 8005);
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true
});
sequelize.sync({ force: false })
  .then(() => {
    console.log('데이터베이스 연결 성공');
  })
  .catch((err) => {
    console.error(err);
  });
connect();

const sessionMiddleware = session({
  resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true,
        secure: false,
    },
});

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
//라우트 설정 ex. app.use('/', Router);
app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/room', roomRouter);
app.use('/chat', chatRouter);
app.use('/workspace', workspaceRouter);
app.use('/solo/workspace', solo_workspaceRouter);
app.use('/conference', conferenceRouter);
app.use('/calendar', calendarRouter);
app.use('/solo/calendar', solo_calendarRouter);
app.use('/share', shareRouter);
app.use('/dashboard', dashboardRouter);
app.use('/profile', profileRouter);
app.use('/staffinvite', staffinviteRouter);
app.use('/school_record',schoolrecord_router);
app.use('/self_introduce', self_introduce_router);

app.use('/staff', staffRouter);
app.use('/solo/studentbook', studentbookRouter);
app.use('/coverletter', coverletterRouter);
app.use('/settings', settingsRouter);


app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    //res.locals.message = err.message;
    //res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
    console.error(err);
    res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
    return res.end(`<script>alert("${err}"); location.href="/"</script>`);
});

const server = app.listen(app.get('port'), () => {
    console.log(`http://localhost:${app.get('port')}`);
});

webSocket(server, app, sessionMiddleware);