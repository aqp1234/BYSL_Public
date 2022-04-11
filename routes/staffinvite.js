const express = require('express');

const Staffinvite = require('../schemas/staffinvite');
const User = require('../models/user');

const router = express.Router();

router.get('/', async(req, res) => {
    const staffinvites = await Staffinvite.find({
        user_id: req.user.id,
        url: req.query.url,
    });
    res.render('staffinvite/main', { staffinvites });
});

router.post('/', async(req, res, next) => {
    try{
        const { staff_email, url, type } = req.body;
        const exstaffinvite = await Staffinvite.findOne({
            staff_email,
            url,
        });
        if(exstaffinvite){
            return res.status(400).send(`<script>alert("이미 초대된 이메일입니다."); window.location.href="";</script>`);
        }else{
            const staff = await User.findOne({
                where: {
                    email: staff_email,
                }
            });
            await Staffinvite.create({
                url,
                type,
                user_id: req.user.id,
                user_name: req.user.name,
                staff_email,
                staff_id: staff ? staff.dataValues ? staff.dataValues.id : null : null,
                staff_name: staff ? staff.dataValues ? staff.dataValues.name : null : null,
            });
            return res.status(200).send(`<script>alert("초대가 완료되었습니다."); window.location.href="";</script>`);
        }
    }catch(err){
        console.error(err);
        next(err);
    }
});

router.delete('/', async(req, res, next) => {
    try{
        await Staffinvite.deleteOne({
            staff_email: req.body.staff_email,
            url: req.body.url,
        });
        return res.status(200).send({ msg: '초대 삭제 완료했습니다.' });
    }catch(err){
        console.error(err);
        next(err);
    }
})

module.exports = router;