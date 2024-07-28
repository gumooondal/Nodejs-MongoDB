const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt') //hashing 알고리즘

const users = [
    { email: 'existing@example.com' }
  ]
  
  router.post('/check-email', (req, res) => {
    const { email } = req.body;
    console.log('Email to check:', email);
  
    const userExists = users.some(user => user.email === email);
  
    if (userExists) {
      console.log('이이미 사용 중입니다:', email);
    } else {
      console.log('사용 가능합니다:', email);
    }
  
    res.json({ exists: userExists });
  });

router.get('/', (요청, 응답) => {
    응답.render('register')
})

router.get('/list', (req, res) => {
    res.send('hello list');
})

router.post('/regSubmit', async (요청, 응답) => {
    let useremail = 요청.body.useremail;
    let 해시 = await bcrypt.hash(요청.body.password, 10)
    console.log(useremail)
    // await db.collection('user').insertOne({
    //     useemail: 요청.body.useemail,
    //     password: 해시
    // })
    응답.render('afterLogin.ejs', { user: { useremail: useremail } });
  })
module.exports = router