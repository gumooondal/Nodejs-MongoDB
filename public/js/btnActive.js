// 클릭된 버튼을 저장하기 위한 변수
let activeButton = null;

// 버튼 클릭 시 상태 토글 함수
function handleButtonClick(buttonType) {
    const searchButton = document.getElementById('btnSearch');
    const myButton = document.getElementById('btnMy');

    // 클릭된 버튼에 'btn-active' 클래스 추가
    if (buttonType === 'search') {
        if (activeButton && activeButton !== searchButton) {
            activeButton.classList.remove('btn-active');
        }
        searchButton.classList.add('btn-active');
        activeButton = searchButton;
    } else if (buttonType === 'my') {
        if (activeButton && activeButton !== myButton) {
            activeButton.classList.remove('btn-active');
        }
        myButton.classList.add('btn-active');
        activeButton = myButton;
    }
}

// 페이지 버튼 클릭 시 상태 변경하지 않도록
document.addEventListener('click', (event) => {
    if (event.target.closest('.btnArea-search') && event.target.closest('.btnArea-my')) {
        if (activeButton) {
            activeButton.classList.remove('btn-active');
            activeButton = null;
        }
    }
});
