const express = require('express');
const passport = require('passport');

module.exports = (db) => {
    const router = express.Router();
  
    router.post('/login', async (req, res, next) => {
      let username = req.body.username;
      console.log(username);
      let user = await db.collection('user').findOne({ username: username });
      let centernames = await db.collection('location').find().limit(5).toArray();
  
      passport.authenticate('local', (error, user, info) => {
        if (error) return res.status(500).json(error);
        if (!user) return res.status(401).json(info.message);
        req.logIn(user, (err) => {
            if (err) return next(err);
          
            // 세션에 사용자 데이터 저장
            req.session.user = user;

            // /main으로 리다이렉트
            return res.redirect('/main');
        });
      })(req, res, next);
    });
  
    return router;
  };