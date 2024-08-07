
const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    router.get('/', async (req, res) => {
        try {
            let locationList = await db.collection('location').find().toArray();
             console.log(locationList);
            let count = await db.collection('location').countDocuments();
            console.log(`Number of documents: ${count}`);

            // 세션에서 사용자 데이터 가져오기
            const user = req.session.user;
            console.log(user)
          
            // 데이터를 포함하여 main 페이지 렌더링
            res.render('main', { locationList: locationList, user: user });
        } catch (error) {
          res.status(500).send(error.message);
        }
    });

    router.get('/search', (req, res)=>{
        res.render('search.ejs')
    }) 

    router.get('/searchAction', async (req, res) => {
        try {
            const searchQuery = req.query.q;
            const page = parseInt(req.query.page, 10) || 1; // 현재 페이지, 기본값은 1
            const pageSize = parseInt(req.query.pageSize, 10) || 4; // 페이지당 항목 수, 기본값은 4
        
            console.log('Received search query:', searchQuery); 
        
            if (!searchQuery) {
                return res.status(400).send('검색어를 입력하세요.');
            }
        
            // 총 항목 수와 페이지 수를 계산하기 위해 총 결과 수를 먼저 가져옵니다
            const totalResults = await db.collection('location').countDocuments({
                centername: { $regex: searchQuery, $options: 'i' }
            });
        
            const totalPages = Math.ceil(totalResults / pageSize);
        
            // 모든 결과를 가져옵니다
            const location = await db.collection('location').find({
                centername: { $regex: searchQuery, $options: 'i' }
            }, {
                projection: { _id: 1, centername: 1, address: 1, phonenumber: 1, latitude: 1, longitude: 1 }
            })
            .toArray();
        
            if (location.length > 0) {
                res.json({
                    data: location,
                    totalPages: totalPages,
                    currentPage: page,
                    totalResults: totalResults // 전체 결과 수를 반환
                });
                console.log(location);
            } else {
                res.status(404).send('결과를 찾을 수 없습니다.');
            }
        } catch (err) {
            console.error('서버 오류:', err);
            res.status(500).send('서버 오류');
        }
    });
    
    router.post('/favorite', async (req, res) => {
        const { id, username } = req.body; // 클라이언트로부터 받은 ID와 username
    
        // ID와 username이 제공되었는지 확인
        if (!id || !username) {
            return res.status(400).json({ success: false, message: 'ID and username are required' });
        }
    
        try {
            // 로그 출력 (디버깅 용도)
            console.log('Received ID:', id);
            console.log('Received Username:', username);
    
            const collection = db.collection('favorite');
            await collection.insertOne({ location_id: id, username: username, created_at: new Date() });
    
            // 성공 응답을 클라이언트로 반환
            res.json({ success: true });
        } catch (error) {
            // 중복된 데이터로 인한 에러 처리
            if (error.code === 11000) { // DuplicateKeyError
                res.status(409).json({ success: false, message: 'Duplicate entry detected' });
            } else {
                console.error('Error:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        }
    });
   
  return router;
};