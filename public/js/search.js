// public/js/search.js

let currentPage = 1;
const pageSize = 4; // 페이지당 항목 수
let lastQuery = '';
let allSearchResults = []; // 전체 검색 결과를 저장할 배열

function searchPlaces() {
    const query = document.getElementById('searchInput').value.trim();

    // 입력 필드가 비어 있는지 확인합니다.
    if (query.trim() === '') {
        // 빈 경우 경고창을 표시합니다.
        alert('장소를 입력하세요.');
        return; // 함수 실행을 중지합니다.
    }

    // 검색어가 변경되면 currentPage를 1로 초기화
    if (query !== lastQuery) {
        currentPage = 1;
        lastQuery = query;
    }

      // 맵을 초기 상태로 되돌립니다.
      initMap(); // 초기화 함수 호출

      // 검색 전에 기존 마커를 모두 제거
      removeMarkers();
  

    fetch(`/main/searchAction?q=${encodeURIComponent(query)}&page=1&pageSize=Infinity`)
        .then(response => {
            if (!response.ok) {
                throw new Error('검색 결과를 찾을 수 없습니다.');
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data); // 데이터 확인

            // 검색 전에 기존 마커를 모두 제거
            removeMarkers();

            // 기존 검색 결과 HTML 요소 제거
            document.getElementById('results-container').innerHTML = '';

            if (Array.isArray(data.data) && data.data.length > 0) {
                allSearchResults = data.data; // 모든 검색 결과 저장
                displayPageResults(); // 현재 페이지 결과 표시
                updatePagination(data.totalPages); // 페이지네이션 업데이트
                showMarkers(allSearchResults); // 지도에 모든 검색 결과 마커 표시
            } else {
                document.getElementById('results-container').innerHTML = '<p>검색 결과가 없습니다.</p>';
                // 기존 마커를 모두 제거
                removeMarkers();
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
            document.getElementById('results-container').innerHTML = `<div class="bottom-list"><p>${error.message}</p></div>`;
        });
}

function displayPageResults() {
    const container = document.getElementById('results-container');
    container.innerHTML = ''; // 이전 결과 제거

    const start = (currentPage - 1) * pageSize;
    const end = currentPage * pageSize;
    const pageResults = allSearchResults.slice(start, end);

    pageResults.forEach(location => {
        const div = document.createElement('div');
        div.classList.add('bottom-list', 'active'); // 'active' 클래스를 추가하여 보이게 함
        div.innerHTML = `
            <strong>${location.centername}</strong>
            <p>
                주소 - ${location.address}<br>
                연락처 - ${location.phonenumber}
                  <span class="favorite-icon" onclick="checkLoginAndToggleFavorite(this, '${location._id}')">
                    <ion-icon name="star-outline"></ion-icon>
                  </span>                
            </p>
        `;
        container.appendChild(div);
    });
}

function updatePagination(totalPages) {
    const paginationContainer = document.getElementById('pagination-buttons');
    paginationContainer.innerHTML = ''; // 이전 페이지 버튼 제거

    // Previous 버튼
    if (currentPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.onclick = () => changePage(currentPage - 1);
        paginationContainer.appendChild(prevButton);
    }

    // Page 번호 버튼
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.onclick = () => changePage(i);
        if (i === currentPage) {
            pageButton.classList.add('active'); // 현재 페이지 표시
        }
        paginationContainer.appendChild(pageButton);
    }

    // Next 버튼
    if (currentPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.onclick = () => changePage(currentPage + 1);
        paginationContainer.appendChild(nextButton);
    }
}

function changePage(page) {
    currentPage = page;
    displayPageResults(); // 현재 페이지 결과 표시
    updatePagination(Math.ceil(allSearchResults.length / pageSize)); // 페이지네이션 업데이트
}

document.getElementById('btnSearch').addEventListener('click', searchPlaces);
