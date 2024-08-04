const express = require('express') //express라이브러리를 사용하겠다는 뜻
const app = express()
//---------------------------------
app.use(express.static(__dirname + '/public')) //css파일 등록
//---------------------------------
const MongoStore = require('connect-mongo') //mongodb 라이브러리 셋팅
//---------------------------------
app.set('view engine', 'ejs') //ejs 셋팅
//---------------------------------
app.use(express.json()) //유저가 보낸 정보를 서버에서 쉽게 출력해보기 위한 셋팅
app.use(express.urlencoded({ extended: true }))
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
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 },
  store: MongoStore.create({
    mongoUrl: process.env.DB_URL,
    dbName: 'forum'
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
connectDB.then((client) => {
  console.log('DB연결성공')
  db = client.db('forum')

  const mapRouter = require('./route/main.js')(db)
  const authRouter = require('./route/auth.js')(db);

  app.use('/main', mapRouter)
  app.use('/auth', authRouter);
  //서버 띄우는 코드
  app.listen(process.env.PORT, () => {
    console.log('http://localhost:' + process.env.PORT + ' 에서 서버 실행중')
  })

}).catch((err) => {
  console.log(err)
})

app.get('/', (요청, 응답) => {
  응답.sendFile(__dirname + '/index.html')
})


// Passport의 LocalStrategy를 설정하여 사용자가 로그인할 때 아이디와 비밀번호를 인증합니다.
passport.use(new LocalStrategy(async (입력한아이디, 입력한비번, cb) => {
  try {
    // 데이터베이스에서 사용자 정보를 조회합니다.
    let result = await db.collection('user').findOne({ username: 입력한아이디 });

    // 사용자 정보가 없으면, 인증 실패로 처리하고 콜백을 호출합니다.
    if (!result) {
      return cb(null, false, { message: '아이디 DB에 없음' });
    }

    // 입력한 비밀번호와 데이터베이스에 저장된 비밀번호를 비교합니다.
    // bcrypt.compare를 사용하여 비밀번호를 비교합니다.
    if (await bcrypt.compare(입력한비번, result.password)) {
      // 비밀번호가 일치하면, 인증 성공으로 처리하고 사용자 정보를 콜백을 통해 반환합니다.
      return cb(null, result);
    } else {
      // 비밀번호가 일치하지 않으면, 인증 실패로 처리하고 콜백을 호출합니다.
      return cb(null, false, { message: '비번불일치' });
    }
  } catch (error) {
    // 인증 과정에서 오류가 발생하면, 오류를 콜백을 통해 반환합니다.
    return cb(error);
  }
}));


// 사용자가 로그인한 후, 사용자 정보를 세션에 저장하기 위해 serializeUser를 설정합니다.
passport.serializeUser((user, done) => {
  // process.nextTick을 사용하여 비동기적으로 실행합니다.
  process.nextTick(() => {
    // 사용자 객체에서 필요한 정보만 추출하여 세션에 저장합니다.
    // 여기서는 사용자 ID와 사용자명을 세션에 저장합니다.
    done(null, { id: user._id, username : user.username });
  });
});

// 세션에서 사용자 정보를 가져와 역직렬화하기 위해 deserializeUser를 설정합니다.
passport.deserializeUser(async (user, done) => {
  // 데이터베이스에서 사용자 정보를 조회합니다.
  // 세션에 저장된 사용자 ID를 사용하여 사용자 정보를 찾습니다.
  let result = await db.collection('user').findOne({ _id: new ObjectId(user.id) });

  // 사용자 정보에서 비밀번호를 제거합니다.
  delete result.password;

  // process.nextTick을 사용하여 비동기적으로 실행합니다.
  process.nextTick(() => {
    // 조회된 사용자 정보를 done 콜백을 통해 반환합니다.
    // 이 정보는 req.user에 저장되어 요청 처리 중에 사용할 수 있습니다.
    return done(null, result);
  });
});


app.get('/login', (요청, 응답) => {
  console.log(요청.user)
  응답.render('login.ejs')
})

app.get('/login2', (요청, 응답) => {
  응답.render('login2.ejs')
})

// 로그인 상태 확인 미들웨어
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.isAuthenticated();
  next();
});

app.get('/check-login', (req, res) => {
  if (req.isAuthenticated()) {
      res.json({ loggedIn: true });
  } else {
      res.json({ loggedIn: false });
  }
});

// app.post('/login', async (요청, 응답, next) => {
//   let username = 요청.body.username;
//   console.log(username)
//   let user = await db.collection('user').findOne({ username: username });
//   let centernames = await db.collection('location').find().limit(5).toArray();

//   passport.authenticate('local', (error, user, info) => {
//     if (error) return 응답.status(500).json(error)
//     if (!user) return 응답.status(401).json(info.message)
//     요청.logIn(user, (err) => {
//       if (err) return next(err);

//       // 로그인한 사용자가 관리자인지 확인하여 페이지를 분기합니다.
//       if (user === 'admin@mail.com') {
//         // 페이지 번호와 페이지 당 아이템 수를 요청에서 가져옵니다.
//         let page = parseInt(요청.query.page) || 1;
//         let perPage = parseInt(요청.query.perPage) || 5;
//         // 관리자 페이지로 이동
//         return 응답.render('/main');
//       } else {
//         // 일반 사용자 페이지로 이동
//         return 응답.render('afterLogin.ejs', { user: user });
//       }

//     })
//   })(요청, 응답, next)

// })

// 로그아웃 처리 라우터를 설정합니다.
app.post('/logout', (req, res, next) => {
  // req.logout 메서드를 호출하여 로그아웃합니다.
  req.logout(err => {
    if (err) {
      // 로그아웃 중 오류가 발생하면, 오류를 처리합니다.
      return next(err);
    }
    // 세션을 파기하여 사용자 데이터를 삭제합니다.
    req.session.destroy(() => {
      // 클라이언트 측 세션 쿠키를 삭제합니다.
      res.clearCookie('connect.sid');
      // 로그아웃 후 홈 페이지로 리디렉션합니다.
      res.redirect('/main');
    });
  });
});

app.use('/register', registerRouter)

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

app.get('/user', async (요청, 응답) => {
  let result = await db.collection('user').find().toArray()
  응답.render('user.ejs', { user: result })
})

app.get('/addLocation', (요청, 응답) => {
  응답.render('addLocation.ejs')
})

app.get('/mainCopy', (요청, 응답) => {
  응답.render('mainCopy.ejs')
})

// 잘못된 예제
// app.get('/admin/2', async(요청,응답) =>{
//   let centernames = await db.collection('location').find().skip(5).limit
//   (5).toArray();
//   응답.render(admin.ejs, { centernames: centernames });
// })

// app.get('/admin', async (요청, 응답) => {
//   let centernames = await db.collection('location').find().limit(5).toArray();
//   응답.render('admin.ejs', { user: 요청.user, center: centernames });
// });

// app.get('/admin/2', async (요청, 응답) => {
//   let username = 요청.body.username;
//   let user = await db.collection('user').findOne({ username: username });
//   let centernames = await db.collection('location').find().skip(5).limit(5).toArray();
//   응답.render('admin.ejs', { user: 요청.user, center: centernames });
// });

// 라우터 나누는 것도 해야함

app.get('/', (요청, 응답) => {
  응답.sendFile(__dirname + '/index.html')
})

app.get('/map', (요청, 응답) => {
  응답.render('map.ejs', {
    javascriptkey: process.env.javascriptkey
  })
})

app.post('/search', async (req, res) => {
  const keyword = req.body.keyword;
  console.log('Received keyword:', keyword);

  try {
    // 키워드가 포함된 centername 필드를 검색
    let centernames = await db.collection('location').find({ centername: { $regex: keyword, $options: 'i' } }).toArray();

    if (centernames.length > 0) {
      console.log(centernames[0].centername, centernames[0].latitude, centernames[0].
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
