const express = require('express') //express라이브러리를 사용하겠다는 뜻
const app = express()
//---------------------------------
app.use(express.static(__dirname +'/public')) //css파일 등록
//---------------------------------
const MongoStore = require('connect-mongo') //mongodb 라이브러리 셋팅
//---------------------------------
app.set('view engine', 'ejs') //ejs 셋팅
//---------------------------------
app.use(express.json()) //유저가 보낸 정보를 서버에서 쉽게 출력해보기 위한 셋팅
app.use(express.urlencoded({extended:true}))
//---------------------------------
const methodOverride = require('method-override') //form에서 put,delete 요청할 수 있는 방법
app.use(methodOverride('_method')) 
//---------------------------------
const session = require('express-session') // passport라이브러리
const passport = require('passport')
const LocalStrategy = require('passport-local')
//---------------------------------
require('dotenv').config() //.env파일에 환경변수 보관하기 위한
const registerRouter = require('./route/register.js')

const bodyParser = require('body-parser');

app.use(passport.initialize())
app.use(session({
  secret: '암호화에 쓸 비번',
  resave : false,
  saveUninitialized : false,
  cookie : { maxAge : 60 * 60 * 1000},
  store : MongoStore.create({
    mongoUrl : process.env.DB_URL,
    dbName : 'forum'
  })
}))

app.use(passport.session())
//---------------------------------
const bcrypt = require('bcrypt') //hashing 알고리즘
//---------------------------------
const { MongoClient, ObjectId } = require('mongodb') //세션을 DB에 저장하기 위한 connect-mongo라이브러리
//---------------------------------
let connectDB = require('./database.js') //라우터파일에서 DB쓰기위한
//---------------------------------
let db;
connectDB.then((client)=>{
  console.log('DB연결성공')
  db = client.db('forum')

  const mapRouter = require('./route/main.js')(db)

  app.use('/main',mapRouter)
  //서버 띄우는 코드
  app.listen(process.env.PORT, () => {
    console.log('http://localhost:'+process.env.PORT+' 에서 서버 실행중')
})

}).catch((err)=>{
  console.log(err)
})

app.get('/', (요청, 응답) => {
  응답.sendFile(__dirname + '/index.html')
}) 

passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  let result = await db.collection('user').findOne({ username : 입력한아이디})
  if (!result) {
    return cb(null, false, { message: '아이디 DB에 없음' })
  }

 
  if ( await bcrypt.compare(입력한비번, result.password)) {
    return cb(null, result) 
  } else {
    return cb(null, false, { message: '비번불일치' });
  }
}))

passport.serializeUser((user, done) => {
  process.nextTick(() => {
    done(null, { id: user._id, username: user.username })
  })
})

passport.deserializeUser(async(user, done) => {
  let result = await db.collection('user').findOne({_id : new ObjectId(user.id) })
  delete result.password
  process.nextTick(() => {
    return done(null, result)
  })
})

app.get('/login', (요청, 응답)=>{
  console.log(요청.user)
  응답.render('login.ejs')
}) 

app.get('/login2', (요청, 응답)=>{
  응답.render('login2.ejs')
}) 

app.post('/login', async (요청, 응답, next) => {
  let username = 요청.body.username;
  let user = await db.collection('user').findOne({username: username});
  let centernames = await db.collection('location').find().limit(5).toArray();

  passport.authenticate('local', (error, user, info) => {
      if (error) return 응답.status(500).json(error)
      if (!user) return 응답.status(401).json(info.message)
      요청.logIn(user, (err) => {
        if (err) return next(err);
        
        // 로그인한 사용자가 관리자인지 확인하여 페이지를 분기합니다.
        if (username === 'admin@mail.com') {
          // 페이지 번호와 페이지 당 아이템 수를 요청에서 가져옵니다.
          let page = parseInt(요청.query.page) || 1;
          let perPage = parseInt(요청.query.perPage) || 5;
          // 관리자 페이지로 이동
          return 응답.redirect('/admin');
        } else {
          // 일반 사용자 페이지로 이동
          return 응답.render('afterLogin.ejs', { user: user });
      }
        
      })
  })(요청, 응답, next)

})

app.use('/register',registerRouter)

// app.get('/register', (요청, 응답) => {
//   응답.render('register.ejs')
// })

// app.post('/register', async (요청, 응답) => {
//   let useemail = 요청.body.useemail;
//   let 해시 = await bcrypt.hash(요청.body.password, 10)

//   await db.collection('user').insertOne({
//       useemail: 요청.body.useemail,
//       password: 해시
//   })
//   응답.render('afterLogin.ejs', { user: { useemail: useemail } });
// })

app.get('/user',async (요청, 응답) =>{
  let result = await db.collection('user').find().toArray()
  응답.render('user.ejs', {user : result})
})

app.get('/addLocation', (요청,응답) =>{
  응답.render('addLocation.ejs')
})

// 잘못된 예제
// app.get('/admin/2', async(요청,응답) =>{
//   let centernames = await db.collection('location').find().skip(5).limit
//   (5).toArray();
//   응답.render(admin.ejs, { centernames: centernames });
// })

app.get('/admin', async (요청, 응답) => {
  let centernames = await db.collection('location').find().limit(5).toArray();
  응답.render('admin.ejs', { user: 요청.user, center: centernames });
});
 
app.get('/admin/2', async (요청, 응답) => {
  let username = 요청.body.username;
  let user = await db.collection('user').findOne({username: username});
  let centernames = await db.collection('location').find().skip(5).limit(5).toArray();
  응답.render('admin.ejs', { user: 요청.user, center: centernames });
});

// 라우터 나누는 것도 해야함

app.get('/', (요청, 응답) => {
  응답.sendFile(__dirname + '/index.html')
}) 

app.get('/map', (요청, 응답) =>{
  응답.render('map.ejs',{
    javascriptkey:process.env.javascriptkey
})
})

app.post('/search', async (req, res) => {
  const keyword = req.body.keyword;
  console.log('Received keyword:', keyword);

  try {
      // 키워드가 포함된 centername 필드를 검색
      let centernames = await db.collection('location').find({ centername: { $regex: keyword, $options: 'i' } }).toArray();

      if (centernames.length > 0) {
          console.log(centernames[0].centername,centernames[0].latitude,centernames[0].
          longitude);
          // 키워드를 처리하고 적절히 응답
          res.json({ message: 'Keyword received', keyword: keyword, results: centernames });
      } else {
          // 해당하는 데이터가 없음을 클라이언트에게 알림
          res.status(404).json({ message: 'No data found for the keyword' });
          console.log('해당데이터 없음');
      }
  } catch (error) {
      console.error('Error fetching documents:', error);
      res.status(500).json({ message: 'Error fetching documents', error: error.message });
  }
});
