// public/js/pagination.js

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