const express = require('express');

const router = express.Router();

const { isLoggedIn, isInWorkspace, checkPermission } = require('./middlewares');

const Share = require('../schemas/share');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
try{
    fs.readdirSync('uploads');
}catch(err){
    fs.mkdirSync('uploads');
}
const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done){
            done(null, 'uploads/');
        },
        filename(req, file, done){
            const ext = path.extname(file.originalname); // ext는 파일의 확장자 반환
            done(null, path.basename(file.originalname, ext) + Date.now() + ext); 
            // path.basename(파일명, 확장자)함수는 파일명 추출하여 확장자를 제외 후 출력
            // Date.now 를 한 이유는 파일명 동일한것을 방지하기 위해 파일명에 날짜 정보 입력
        },
    }),
    //limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/:id', isLoggedIn, isInWorkspace, checkPermission(17), async(req, res, next) => { // permission : 17
    try{
        const exshares = await Share.find({
            workspace_id: req.params.id,
        }).sort({ createdAt: -1 });
        res.render('share/main', { shares: exshares });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/add', isLoggedIn, isInWorkspace, checkPermission(15), async(req, res, next) => { // permission : 15
    try{
        res.render('share/add');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/add', upload.array('file'), isLoggedIn, isInWorkspace, checkPermission(15), async(req, res, next) => { // permission : 15
    try{
        const { subject, content } = req.body;
        const file_path = [];
        const file_name = [];
        if(req.files){
            for(i = 0; i < req.files.length; i++){
                file_path.push({path: req.files[i].path});
                file_name.push({name: req.files[i].originalname});
            }
        }else{
            file_path = [];
            file_name = [];
        }
        await Share.create({
            workspace_id: req.params.id,
            user_id: req.user.id,
            user_name: res.locals.user_workspace.nick,
            subject,
            content,
            file_path,
            file_name,
        });
        res.redirect('/share/' + req.params.id);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/detail/:shareid', isLoggedIn, isInWorkspace, checkPermission(17), async(req, res, next) => { // permission : 17
    try{
        const exshare = await Share.findOne({
            _id: req.params.shareid,
        });
        res.render('share/detail', { share: exshare });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/change/:shareid', isLoggedIn, isInWorkspace, checkPermission(18), async(req, res, next) => { // permission : 18
    try{
        const exshare = await Share.findOne({
            _id: req.params.shareid,
        });
        res.render('share/change', { share: exshare });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/change/:shareid', upload.array('file'), isLoggedIn, isInWorkspace, checkPermission(18), async(req, res, next) => { // permission : 18
    try{
        const { subject, content, deletefile } = req.body;
        const exshare = await Share.findOne({
            _id: req.params.shareid,
        });
        const file_path = exshare.file_path;
        const file_name = exshare.file_name;
        if(deletefile){
            for(i = 0; i < deletefile.length; i++){
                file_path.splice(deletefile[i], 1);
                file_name.splice(deletefile[i], 1);
            }
        }
        if(req.files){
            for(i = 0; i < req.files.length; i++){
                file_path.push({path: req.files[i].path});
                file_name.push({name: req.files[i].originalname});
            }
        }
        await Share.updateOne({
            _id: req.params.shareid,
        }, {
            $set: {
                subject,
                content,
                file_path,
                file_name,
                updatedAt: Date.now(),
            }
        });
        res.redirect('/share/' + req.params.id + "/detail/" + req.params.shareid);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/delete/:shareid', isLoggedIn, isInWorkspace, checkPermission(16), async(req, res, next) => { // permission : 16
    try{
        await Share.deleteOne({
            _id: req.params.shareid,
        });
        res.redirect('/share/' + req.params.id );
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/download/:shareid/:num', isLoggedIn, isInWorkspace, checkPermission(17), async(req, res, next) => { // permission : 17
    try{
        const exshare = await Share.findOne({
            _id: req.params.shareid,
        });
        if(exshare.file_path == null){
            res.redirect('/share/' + req.params.id + '/detail/' + req.params.shareid);
        }
        else{
            res.setHeader('Content-Disposition', `attachment; filename=filename`);
            res.download(exshare.file_path[req.params.num].path, exshare.file_name[req.params.num].name);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;