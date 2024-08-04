function checkLoginAndToggleFavorite(element, locationId) {
    // 서버에 로그인 상태 확인 요청
    fetch('/check-login')
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                // 전역 변수 username을 직접 사용
                if (typeof username !== 'undefined' && username) {
                    sendFavoriteId(locationId, username);
                } else {
                    console.error('Username is not defined or empty.');
                }
            } else {
                // 로그인되어 있지 않을 경우 경고 메시지 표시
                alert('로그인 후 이용해주세요');
            }
        })
        .catch(error => console.error('Error:', error));
}

function sendFavoriteId(id) {
fetch('/main/favorite', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id: id , username: username })
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        console.log('ID and username successfully sent to server');
        // 추가로 필요한 경우, UI 업데이트 등을 수행할 수 있습니다
    } else {
        console.error('Failed to send ID and username to server');
    }
})
.catch(error => console.error('Error:', error));
}