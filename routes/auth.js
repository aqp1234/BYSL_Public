const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const request = require('request');
const { isLoggedIn } = require('./middlewares');
const User = require('../models/user');
const StaffInvite = require('../schemas/staffinvite');
const { NICE_KEY } = process.env;
const { smtpTransport } = require('../config/email');

const router = express.Router();

router.post('/join/sendEmail', async(req, res, next) => {
    try{
        var randomNum = Math.floor(Math.random() * 1000000);
        const { email } = req.body;
        
        const mailOptions = {
            from: '[BYSL] <aqp0222@naver.com>',
            to: email,
            subject: '[BYSL]인증 메일입니다.',
            html: '<div>해당 6자리 숫자를 입력해주세요 : ' + randomNum + '</div>',
        };

        const number = await bcrypt.hash(String(randomNum), 12);

        await smtpTransport.sendMail(mailOptions, (error, responses) => {
            if(error){
                console.error(error);
                return res.status(400).send({ msg: '인증에 실패했습니다. 다시 시도해주세요.'});
            }else{
                return res.status(200).send({ msg: '인증번호가 발송되었습니다.', number: number });
            }
        });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/join/checkCertNo', async(req, res, next) => {
    try{
        const { certNo, inputNum } = req.body;
        const result = await bcrypt.compare(String(inputNum), String(certNo));
        if(result){
            res.status(200).send({ msg: '인증이 완료되었습니다.' });
        }else{
            res.status(401).send({ msg: '인증에 실패하였습니다. 인증번호를 다시 확인해주세요.' });
        }
    }catch(err){
        console.error(err);
        next(err);
    }
})

router.post('/join', async (req, res, next) => {
    try{
        if(req.query.type == 'student'){
            const { email, firstname, secondname, password, phone, location_name, school_name } = req.body;
            const exUser = await User.findOne({ where: { email } });
            if(exUser){
                res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end(`<script>alert("이미 존재하는 이메일 입니다."); location.href="";</script>`);
            }
            const hash = await bcrypt.hash(password, 12);
            const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${NICE_KEY}&Type=json&pindex=1&pSize=100&SCHUL_NM=${encodeURI(school_name)}&LCTN_SC_NM=${encodeURI(location_name)}`;
            await request(url, async (err, response, body) => {
                if(err){
                    console.error(err);
                    next(err);
                }
                bodyjson = JSON.parse(body);
                var location_code = bodyjson.schoolInfo[1].row[0].ATPT_OFCDC_SC_CODE;
                var school_code = bodyjson.schoolInfo[1].row[0].SD_SCHUL_CODE;
                const new_user = await User.create({
                    email,
                    name: `${firstname}${secondname}`,
                    password: hash,
                    phone,
                    school_code,
                    school_name,
                    location_code,
                    location_name,
                    is_student: true,
                });
                await StaffInvite.updateMany({
                    staff_email: email,
                }, {
                    $set: {
                        staff_id: new_user.id,
                        staff_name: `${firstname}${secondname}`,
                    }
                });
            });
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end('<script>alert("회원가입이 완료되었습니다."); location.href="/auth/login";</script>');
        }else if(req.query.type == 'staff'){
            const { email, firstname, secondname, password, phone } = req.body;
            const exUser = await User.findOne({ where: { email } });
            if(exUser){
                res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end(`<script>alert("이미 존재하는 이메일 입니다."); location.href="";</script>`);
            }
            const hash = await bcrypt.hash(password, 12);
            const new_user = await User.create({
                email,
                name: `${firstname}${secondname}`,
                password: hash,
                phone,
                is_student: false,
            });
            await StaffInvite.updateMany({
                staff_email: email,
            }, {
                $set: {
                    staff_id: new_user.id,
                    staff_name: `${firstname}${secondname}`,
                }
            });
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end('<script>alert("회원가입이 완료되었습니다."); location.href="/auth/login";</script>');
        }
        
    } catch(err){
        console.error(err);
        return next(err);
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
        if(authError){
            console.error(authError);
            return next(authError);
        }
        if(!user){
            res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
            return res.end(`<script>alert("아이디 또는 비밀번호를 확인해주세요."); location.href="";</script>`);
        }
        return req.login(user, (loginError) => {
            if(loginError){
                console.error(loginError);
                return next(loginError);
            }
            if(req.query.next){
                return res.redirect(req.query.next);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/auth/login');
});

router.get('/login', (req, res) => {
    res.render('auth/login', { title: 'MIT' });
});

router.get('/join', (req, res) => {
    if(req.query.type == 'staff'){
        return res.render('auth/staffjoin');
    }else if(req.query.type == 'student'){
        return res.render('auth/join');
    }else{
        res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
        return res.end(`<script>alert("잘못된 경로입니다."); location.href="/auth/login";</script>`);
    }
});

router.get('/findschool', async(req, res, next) => {
    if(req.query.word){
        url = 'https://www.career.go.kr/cnet/openapi/getOpenApi?' + 
        'apiKey=2d9b15f6e339269848ed94121f3a9ce9&svcType=api&svcCode=SCHOOL&contentType=json&gubun=high_list&perPage=10000&searchSchulNm=' + encodeURI(req.query.word);
        await request(url, (err, response, body) => {
            if(err){
                console.error(err);
                next(err);
            }
            if(!JSON.parse(body)['dataSearch']['content'].length){
                console.log('test');
                res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end('<script>alert("검색 결과가 없습니다.");</script>');
            }
            res.send(body);
        })
    }else{
        res.render('auth/findschool');
    }
})

module.exports = router;