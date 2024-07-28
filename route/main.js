
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
    
            // 페이지에 해당하는 결과만 가져옵니다
            const location = await db.collection('location').find({
                centername: { $regex: searchQuery, $options: 'i' }
            }, {
                projection: { _id: 0, centername: 1, address: 1, phonenumber: 1, latitude: 1, longitude: 1 }
            })
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .toArray();
    
            if (location.length > 0) {
                res.json({
                    data: location,
                    totalPages: totalPages,
                    currentPage: page
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
      
  return router;
};