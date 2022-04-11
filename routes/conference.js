const express = require('express');

const router = express.Router();

const Conference = require('../schemas/conference');
const { isLoggedIn, isInWorkspace, checkPermission } = require('./middlewares');

router.get('/:id', isLoggedIn, isInWorkspace, checkPermission(13), async (req, res, next) => { // 기본 conference 페이지에서는 회의록 리스트를 가져와야됨  // permission : 13
    try{
        const conferences = await Conference.find({
            workspace_id: req.params.id,
        }).sort({ createdAt: -1 }); // workspace에 있는 모든 conference 반환 / sort 함수로 만든 시간 기준으로 역순 정렬
        res.render('conference/main.html', { conferences }); // conference/main.html 을 렌더링 하겠다는 뜻
        // 뒤에 title, user_workspace 등은 프론트로 보내주는 변수들
    } catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/add', isLoggedIn, isInWorkspace, checkPermission(11), async(req, res, next) => { // 회의록 추가를 위한 페이지 라우터 // permission : 11
    try{
        res.render('conference/add');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/add', isLoggedIn, isInWorkspace, checkPermission(11), async(req, res, next) => { // permission : 11
    try{
        const { subject, content } = req.body; // post 받아온 내용 subject, content
        await Conference.create({ // db에 insert 문이라 생각하면 됨
            workspace_id: req.params.id,
            user_id: req.user.id,
            user_name: res.locals.user_workspace.nick,
            subject,
            content,
        });
        res.redirect('/conference/' + req.params.id );
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/detail/:conferenceid', isLoggedIn, isInWorkspace, checkPermission(13), async(req, res, next) => { // permission : 13
    try{
        const exconference = await Conference.findOne({ // 조회 필요한 conference 조회
            _id: req.params.conferenceid,
        });
        res.render('conference/detail', { conference: exconference });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/change/:conferenceid', isLoggedIn, isInWorkspace, checkPermission(14), async(req, res, next) => { // permission : 14
    try{
        const exconference = await Conference.findOne({ // 조회 필요한 conference 조회
            _id: req.params.conferenceid,
        });
        res.render('conference/change', { conference: exconference });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/change/:conferenceid', isLoggedIn, isInWorkspace, checkPermission(14), async(req, res, next) => { // permission : 14
    try{
        const { subject, content } = req.body;
        await Conference.updateOne({ // _id 값이 conferenceid 와 동일한 conference 찾아서 변경된 내용으로 update하는 문
            _id: req.params.conferenceid,
        }, {
            $set: {
                subject,
                content,
                updatedAt: Date.now(),
            }
        });
        res.redirect('/conference/' + req.params.id + '/detail/' + req.params.conferenceid );
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/delete/:conferenceid', isLoggedIn, isInWorkspace, checkPermission(12), async(req, res, next) => { // permission : 12
    try{
        await Conference.deleteOne({
            _id: req.params.conferenceid,
        });
        res.redirect('/conference/' + req.params.id );
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router; // 다른곳에서 require을 통해서 이 conference.js 를 불러울수 있도록 설정