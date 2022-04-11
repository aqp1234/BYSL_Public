const express=require('express');
const school_record_router=express.Router();
const { isLoggedIn, isMySoloWorkspace } = require('./middlewares');
const solouser_Workspace = require('../models/solo_workspace');

const multer = require('multer');
const fs = require('fs');
const path = require('path');

const SchoolRecord=require('../schemas/school_record');

//생활기록부 업로드 기능 먼저. 그 다음에 삭제 기능. 뷰어에 보이는건 제일 최신 버전으로.
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


school_record_router.get('/:id', async (req,res,next) => {
    try{
        const exuser_workspace = await solouser_Workspace.findOne({
            where: {
              user_id: req.user.id,
            },
        });

        const latest_file = await SchoolRecord.findOne({
            user_id: req.user.id},
            ['updatedAt','file_name','file_path'],
            {
                limit:1, 
                sort:{updatedAt:-1}
            },
        );

        res.render('solo_school_record/main',{latest:latest_file, user_workspace: res.locals.user_workspace,solo_workspace: exuser_workspace,workspace_id: req.params.id});
        
    }catch(err){
        console.error(err);
        next(err);
    }
});





school_record_router.get('/:id/list', async (req,res,next) => {
    try{
        const exuser_workspace = await solouser_Workspace.findOne({
            where: {
              user_id: req.user.id,
            },
        });

        const exsrecord = await SchoolRecord.find({
            workspace_id: req.params.id,
        }).sort({ createdAt: -1 });
        
        res.render('solo_school_record/list',{solo_workspace: exuser_workspace, shares:exsrecord});
    }catch(err){
        console.error(err);
        next(err);
    }
    
});

school_record_router.get('/:id/add', async (req,res,next) => {
    try{
        const exuser_workspace = await solouser_Workspace.findOne({
            where: {
              user_id: req.user.id,
            },
        });

        res.render('solo_school_record/add',{solo_workspace: exuser_workspace});
    }catch(err){
        console.error(err);
        next(err);
    }
    
});

//파일 추가를 위한 함수;^:
school_record_router.post('/:id/add', upload.array('file'), async(req, res, next) => {
    try{
        const { subject, content } = req.body;
        console.log(req.files);
        const file_path = [];
        const file_name = [];
        if(req.files){
            for(i = 0; i < req.files.length; i++){
                file_path.push({path: req.files[i].filename});
                file_name.push({name: req.files[i].originalname});
            }
        }else{
            file_path = [];
            file_name = [];
        }
        // const file_path = req.files ? req.files.path : null;
        // const file_name = req.files ? req.files.originalname : null;
        
        await SchoolRecord.create({
            workspace_id: req.params.id,
            user_id: req.user.id,
            user_name: req.user.name,
            subject,
            content,
            file_path,
            file_name,
        });
        res.redirect('/school_record/' + req.params.id);
    }catch(err){
        console.error(err);
        next(err);
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
school_record_router.get('/:id/detail/:shareid', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const exuser_workspace = await SchoolRecord.findOne({
            _id: req.params.shareid,
        });
        //detail.html, list로 보여주는 화면에서 파일 찾아서 viewer로 뿌려주기 위함
        const wanted_file = await SchoolRecord.findOne({
            user_id: req.user.id,
            _id:req.params.shareid
        }).select('file_path');

        res.render('solo_school_record/detail', {wanted:wanted_file,title: '생활기록부', user_workspace: res.locals.user_workspace, share: exuser_workspace, workspace_id: req.params.id});
    }catch(err){
        console.error(err);
        next(err);
    }
});

school_record_router.get('/:id/change/:shareid', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const exuser_workspace = await SchoolRecord.findOne({
            _id: req.params.shareid,
        });
        res.render('solo_school_record/change', {title: 'BYSL', user_workspace: res.locals.user_workspace, share: exuser_workspace, workspace_id: req.params.id });
    }catch(err){
        console.error(err);
        next(err);
    }
});

school_record_router.post('/:id/change/:shareid', upload.array('file'), isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const { subject, content, deletefile } = req.body;
        const exuser_workspace = await SchoolRecord.findOne({
            _id: req.params.shareid,
        });
        const file_path = exuser_workspace.file_path;
        const file_name = exuser_workspace.file_name;
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
        await SchoolRecord.updateOne({
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
        res.redirect('/school_record/' + req.params.id+ '/detail/' + req.params.shareid);
    }catch(err){
        console.error(err);
        next(err);
    }
});

school_record_router.get('/:id/delete/:shareid', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        await SchoolRecord.deleteOne({
            _id: req.params.shareid,
        });
        res.redirect('/school_record/'+req.params.id+ '/list'); // + req.params.id  이거 뺏음
    }catch(err){
        console.error(err);
        next(err);
    }
});

school_record_router.get('/:id/download/:shareid/:num', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const exuser_workspace = await SchoolRecord.findOne({
            _id: req.params.shareid,
        });
        if(exuser_workspace.file_path == null){
            res.redirect('school_record' + req.params.id + '/detail/' + req.params.shareid);
        }
        else{
            res.setHeader('Content-Disposition', `attachment; filename=filename`);
            res.download(exuser_workspace.file_path[req.params.num].path, exuser_workspace.file_name[req.params.num].name);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports=school_record_router;