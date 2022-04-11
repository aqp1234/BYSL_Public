const express=require('express');
const self_introduce_router=express.Router();
const { isLoggedIn, isMySoloWorkspace} = require('./middlewares');
const solouser_Workspace = require('../models/solo_workspace');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const upload = multer({
    storage: multer.diskStorage({
        destination(req, file, done){
            done(null, 'uploads/');
        },
    }),
});


const Selfintroduce=require('../schemas/self_introduce');
const SelfintroduceComment = require('../schemas/self_introducecomment');


self_introduce_router.get('/:id', async (req,res,next) => {
    try{
        const exuser_workspace = await solouser_Workspace.findOne({
            where: {
              user_id: req.user.id,
            },
        });

        const exsrecord = await Selfintroduce.find({
            workspace_id: req.params.id,
        }).sort({ createdAt: -1 });


        res.render('self_introduce/main',{user_workspace: res.locals.user_workspace,shares:exsrecord, solo_workspace: exuser_workspace,workspace_id: req.params.id});
        
    }catch(err){
        console.error(err);
        next(err);
    }
});


self_introduce_router.get('/:id/add', isLoggedIn, isMySoloWorkspace,async (req,res,next) => {
    try{
        const exuser_workspace = await solouser_Workspace.findOne({
            where: {
              user_id: req.user.id,
            },
        });

        res.render('self_introduce/add',{solo_workspace: exuser_workspace});
    }catch(err){
        console.error(err);
        next(err);
    }
    
});

//파일 추가를 위한 함수엿던 부분인것이다 지금은 수정했음 파일 빼고 나머지만 포스트로 받도록
self_introduce_router.post('/:id/add', isLoggedIn, isMySoloWorkspace,  upload.array('file'), async(req, res, next) => {
    try{
        const { subject, content } = req.body;
        
        const selfintro = await Selfintroduce.create({
            workspace_id: req.params.id,
            solo_workspace_id:req.params.id,
            user_id: req.user.id,
            user_name: req.user.name,
            subject,
            content,
        });
        res.redirect(`/self_introduce/${req.params.id}`); //여기가 problem dk tlqkf
    }catch(err){
        console.error(err);
        next(err);
    }
});

self_introduce_router.get('/:id/detail/:self_introduce_id', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const exuser_workspace = await Selfintroduce.findOne({
            _id: req.params.self_introduce_id,
        });
        const selfintro=await Selfintroduce.findOne({
            workspace_id: req.params.id,
            solo_workspace_id:req.params.id,
            user_id: req.user.id,
        });
        const comments=await SelfintroduceComment.find({
            selfcomment_id:req.params.self_introduce_id,
            solo_workspace_id:req.params.id,
        });
                                            //? tlqkf?
        res.render('self_introduce/detail', { comments, selfintro:selfintro, user_workspace: res.locals.user_workspace, share: exuser_workspace, workspace_id: req.params.id});
    }catch(err){
        console.error(err);
        next(err);
    }
});

self_introduce_router.get('/:id/change/:self_introduce_id', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const exuser_workspace = await Selfintroduce.findOne({
            _id: req.params.self_introduce_id,
        });
        res.render('self_introduce/change', {user_workspace: res.locals.user_workspace, share: exuser_workspace, workspace_id: req.params.id });
    }catch(err){
        console.error(err);
        next(err);
    }
});

self_introduce_router.post('/:id/change/:self_introduce_id', upload.array('file'), isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const { subject, content} = req.body;
        const exuser_workspace = await Selfintroduce.findOne({
            _id: req.params.self_introduce_id,
        });
        
        await Selfintroduce.updateOne({
            _id: req.params.self_introduce_id,
        }, {
            $set: {
                subject,
                content,
                updatedAt: Date.now(),
            }
        });
        res.redirect('/self_introduce/' + req.params.id+ '/detail/' + req.params.self_introduce_id); //tlqkf2
    }catch(err){
        console.error(err);
        next(err);
    }
});


self_introduce_router.get('/:id/delete/:self_introduce_id', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        await Selfintroduce.deleteOne({
            _id: req.params.self_introduce_id,
        });
        res.redirect('/self_introduce/'+req.params.id); // + req.params.id  이거 뺏음
    }catch(err){
        console.error(err);
        next(err);
    }
});

/////////////////////////////////////////////////////////////////////////////////////////////댓글



self_introduce_router.get('/:id/:selfcommentid', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const comments = await SelfintroduceComment.find({
            selfcomment_id: req.params.selfcommentid,
            solo_workspace_id: req.params.id,
        });
        return res.render('self_introduce/detail', { comments });
    }catch(err){
        console.error(err);
        next(err);
    }
});

self_introduce_router.delete('/:id/:selfcommentid', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        res.locals.selfintro.delete(); //여기 수정해야함
        return res.status(200).send({ msg: '삭제가 완료되었습니다.' });
    }catch(err){
        console.error(err);
        next(err);
    }
});

self_introduce_router.post("/:id/detail/:selfcommentid/comment", isLoggedIn, async(req, res, next) => {
    try{
        await SelfintroduceComment.create({
            solo_workspace_id: req.params.id,
            selfcomment_id: req.params.selfcommentid,
            user_id: req.user.id,
            user_name: req.user.name,
            comment: req.body.comment,
            is_deleted: false,
        });
        res.redirect(`/self_introduce/${req.params.id}/detail/${req.params.selfcommentid}`); //tlqkf3
    }catch(err){
        console.error(err);
        next(err);
    }
});

self_introduce_router.put("/:id/detail/:selfcommentid/comment/:commentid", isLoggedIn, async(req, res, next) => {
    try{
        const { comment } = req.body;
        console.log(req.body);
        await SelfintroduceComment.updateOne({
            _id: req.params.commentid,
        }, {
            $set: {
                comment,
                updatedAt: Date.now(),
            }
        });
        res.status(200).send({ msg: '정상적으로 댓글이 수정되었습니다.', url: "" });
    }catch(err){
        console.error(err);
        next(err);
    }
});

self_introduce_router.delete("/:id/detail/:selfcommentid/comment/:commentid", isLoggedIn, async(req, res, next) => {
    try{
        await SelfintroduceComment.deleteOne({
            _id: req.params.commentid,
        });
        res.status(200).send({ msg: '정상적으로 삭제되었습니다.', url: "" });
    }catch(err){
        console.error(err);
        next(err);
    }
})

self_introduce_router.get('/:id/change/:selfcommentid', isLoggedIn, isMySoloWorkspace,  async(req, res, next) => {
    try{
        return res.render('self_introduce/change');
    }catch(err){
        console.error(err);
        next(err);
    }
});

self_introduce_router.post("/:id/change/:selfcommentid", isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const { subject, content } = req.body;
        await res.locals.selfintro.updateOne({
            $set: {
                subject,
                content,
                updatedAt: Date.now(),
            }
        }).exec();
        return res.redirect(`/self_introduce/${req.params.id}/detail/${req.params.selfcommentid}`); //tlqkf4
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports=self_introduce_router;