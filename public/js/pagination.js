// public/js/pagination.js

let currentPage = 1;
let pageSize = 4; // 페이지당 항목 수

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
    // 현재 페이지와 동일한 페이지로의 전환은 무시
    if (page === currentPage) return;

    currentPage = page;
    displayPageResults(); // 현재 페이지 결과 표시
    updatePagination(Math.ceil(allSearchResults.length / pageSize)); // 페이지네이션 업데이트
}

export function resetPagination(totalPages) {
    currentPage = 1; // 현재 페이지를 1로 초기화
    updatePagination(totalPages); // 페이지네이션 버튼을 초기화
}