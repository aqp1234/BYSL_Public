const express = require('express');

const Coverletter = require('../schemas/coverletter');
const CoverletterComment = require('../schemas/coverlettercomment');
const { isLoggedIn, isMySoloWorkspace, checkCoverletter } = require('./middlewares');

const router = express.Router();

router.get('/:id', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const coverletters = await Coverletter.find({
            solo_workspace_id: req.params.id,
            user_id: req.user.id,
        });
        return res.render('coverletter/main', { coverletters });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/add', isLoggedIn, isMySoloWorkspace, async(req, res, next) =>{
    try{
        return res.render('coverletter/add');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post('/:id/add', isLoggedIn, isMySoloWorkspace, async(req, res, next) => {
    try{
        const { subject, content } = req.body;
        const coverletter = await Coverletter.create({
            solo_workspace_id: req.params.id,
            user_id: req.user.id,
            user_name: req.user.name,
            subject,
            content,
        });
        return res.redirect(`/coverletter/${req.params.id}/${coverletter._id}`);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.get('/:id/:coverletterid', isLoggedIn, isMySoloWorkspace, checkCoverletter, async(req, res, next) => {
    try{
        const comments = await CoverletterComment.find({
            coverletter_id: req.params.coverletterid,
            solo_workspace_id: req.params.id,
        });
        return res.render('coverletter/detail', { comments });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/:id/:coverletterid', isLoggedIn, isMySoloWorkspace, checkCoverletter, async(req, res, next) => {
    try{
        res.locals.coverletter.delete();
        return res.status(200).send({ msg: '삭제가 완료되었습니다.' });
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post("/:id/:coverletterid/comment", isLoggedIn, async(req, res, next) => {
    try{
        await CoverletterComment.create({
            solo_workspace_id: req.params.id,
            coverletter_id: req.params.coverletterid,
            user_id: req.user.id,
            user_name: req.user.name,
            comment: req.body.comment,
            is_deleted: false,
        });
        res.redirect(`/coverletter/${req.params.id}/${req.params.coverletterid}`);
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.put("/:id/:coverletterid/comment/:commentid", isLoggedIn, async(req, res, next) => {
    try{
        const { comment } = req.body;
        await CoverletterComment.updateOne({
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

router.delete("/:id/:coverletterid/comment/:commentid", isLoggedIn, async(req, res, next) => {
    try{
        await CoverletterComment.deleteOne({
            _id: req.params.commentid,
        });
        res.status(200).send({ msg: '정상적으로 삭제되었습니다.', url: "" });
    }catch(err){
        console.error(err);
        next(err);
    }
})

router.get('/:id/change/:coverletterid', isLoggedIn, isMySoloWorkspace, checkCoverletter, async(req, res, next) => {
    try{
        return res.render('coverletter/change');
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.post("/:id/change/:coverletterid", isLoggedIn, isMySoloWorkspace, checkCoverletter, async(req, res, next) => {
    try{
        const { subject, content } = req.body;
        await res.locals.coverletter.updateOne({
            $set: {
                subject,
                content,
                updatedAt: Date.now(),
            }
        }).exec();
        return res.redirect(`/coverletter/${req.params.id}/${req.params.coverletterid}`);
    }catch(err){
        console.error(err);
        next(err);
    }
});

module.exports = router;