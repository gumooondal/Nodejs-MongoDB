import { favoriteMarkers } from './mapFvt.js';
import { resetPagination } from './pagination.js';

let currentPage = 1;
const pageSize = 4; // 페이지당 항목 수
let lastQuery = '';

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
fetch('/main/favoriteInsert', {
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

document.addEventListener('DOMContentLoaded', () => {
    const btnMy = document.getElementById('btnMy');
    const resultsContainer = document.getElementById('results-container');

    // 로그인 된 경우 자동으로 btnMy 클릭 이벤트 발생
    if (username) {
            fetchMyData(username);
            handleButtonClick('my');
   
    }

    btnMy.addEventListener('click', () => {
            console.log('Sending request with username:', username); 
            fetchMyData(username);

            // 'my' 버튼 클릭 시 favoriteMarkers 함수 호출
            favoriteMarkers(data.fvtLocations);
    });

    function fetchMyData(username) {
        fetch(`/my-data?username=${encodeURIComponent(username)}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // HTML 콘텐츠를 DOM에 삽입
                    resultsContainer.innerHTML = data.htmlContent;

                    // fvtLocations 데이터를 이용하여 지도에 마커 표시
                    favoriteMarkers(data.fvtLocations);

                     // 페이징 초기화
                    const totalPages = Math.ceil(data.fvtLocations.length / pageSize);
                    resetPagination(totalPages); // 페이지네이션 초기화
                } else {
                    console.error('Error:', data.message);
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }
});

function confirmDelete(locationId) {
    console.log(locationId)
    const userConfirmed = confirm('삭제하시겠습니까?');
    if (userConfirmed) {
        deleteFavorite(locationId);
    }
}

// 서버로 요청을 보내는 함수
function deleteFavorite(locationId) {
    fetch('/main/favoriteDelete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: locationId}) // username을 전역 변수에서 가져옴
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('즐겨찾기 항목이 삭제되었습니다.');
            // 성공적으로 삭제된 후, UI를 업데이트하거나 페이지를 새로고침
            updateFavoriteList(); // 즐겨찾기 리스트를 업데이트하는 함수 호출
        } else {
            alert('삭제 실패: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('서버에 문제가 발생했습니다. 나중에 다시 시도해 주세요.');
    });
}

// 예시 함수 정의 (실제로는 즐겨찾기 목록을 갱신하는 코드 필요)
function updateFavoriteList() {
    console.log('Updating favorite list...');
    // 여기에 실제 DOM 업데이트 코드 추가
}

// HTML에서 접근할 수 있도록 함수 노출
// window 객체에 할당하니, HTML에서 접근할 수 있게 되어 문제가 해결됨
// 이 방식은 전역 함수가 필요한 경우에 유용하며, 다른 모듈에서도 비슷한 접근이 필요할 때 활용할 수 있음
window.checkLoginAndToggleFavorite = checkLoginAndToggleFavorite;
window.confirmDelete = confirmDelete;
window.sendFavoriteId = sendFavoriteId;