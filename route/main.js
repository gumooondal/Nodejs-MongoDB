
const express = require('express');

module.exports = (db) => {
    const router = express.Router();

    router.get('/', async (요청, 응답) => {
        let locationList = await db.collection('location').find().toArray()
        console.log(locationList)
        let count = await db.collection('location').countDocuments();
        console.log(`Number of documents: ${count}`);
        응답.render('main', {locationList : locationList})
    })

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
        const { id } = req.body; // 클라이언트로부터 받은 ID
    
        // 여기에서 ID를 처리하는 로직을 추가합니다
        // 예를 들어, 즐겨찾기 목록에 추가하거나 데이터베이스에 저장하는 등의 작업을 수행할 수 있습니다.
    
        console.log('Received ID:', id);
    
        // 성공 응답을 클라이언트로 반환합니다
        res.json({ success: true });
    });
    
      
  return router;
};