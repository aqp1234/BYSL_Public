const express = require('express');

const router = express.Router();

const request = require('request');
const { NICE_KEY } = process.env;
const Staffinvite = require('../schemas/staffinvite');
const User = require('../models/user');
const { isLoggedIn } = require('./middlewares');

router.get('/', isLoggedIn, async (req, res, next) => {
    try{
        const staffinvites = await Staffinvite.find({
            staff_id: req.user.id,
        });
        res.render('staff/main.html', { staffinvites });
    }catch(err){
        console.error(err);
        next(err);
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
                res.writeHead(400, {'Content-Type': 'text/html; charset=utf-8'});
                return res.end('<script>alert("검색 결과가 없습니다.");</script>');
            }
            res.send(body);
        })
    }else{
        res.render('staff/findschool');
    }
});

router.post('/findschool', async(req, res, next) => {
    const { school_name, location_name } = req.body;
    const url = `https://open.neis.go.kr/hub/schoolInfo?KEY=${NICE_KEY}&Type=json&pindex=1&pSize=100&SCHUL_NM=${encodeURI(school_name)}&LCTN_SC_NM=${encodeURI(location_name)}`;
    await request(url, async (err, response, body) => {
        if(err){
            console.error(err);
            next(err);
        }
        bodyjson = JSON.parse(body);
        var location_code = bodyjson.schoolInfo[1].row[0].ATPT_OFCDC_SC_CODE;
        var school_code = bodyjson.schoolInfo[1].row[0].SD_SCHUL_CODE;
        await User.update({
            school_code,
            school_name,
            location_code,
            location_name,
        }, {
            where: {
                id: req.user.id,
            }
        });
        cache.reset();
    });
    return res.send({msg: `학교 설정이 완료되었습니다.`, url: '/'});
})

module.exports = router;