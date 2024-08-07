// 클릭된 버튼을 저장하기 위한 변수
let activeButton = null;

// 버튼 클릭 시 상태 토글 함수
function handleButtonClick(buttonType) {
    const searchButton = document.getElementById('btnSearch');
    const myButton = document.getElementById('btnMy');

    // 클릭된 버튼에 'btn-active' 클래스 추가
    if (buttonType === 'search') {
        if (activeButton) {
            activeButton.classList.remove('btn-active');
        }
        searchButton.classList.add('btn-active');
        activeButton = searchButton;
    } else if (buttonType === 'my') {
        if (activeButton) {
            activeButton.classList.remove('btn-active');
        }
        myButton.classList.add('btn-active');
        activeButton = myButton;
    }
}

// 다른 영역 클릭 시 버튼 상태 초기화
document.addEventListener('click', (event) => {
    // 클릭된 요소가 버튼 영역이 아닌 경우
    if (!event.target.closest('.btnArea-search') && !event.target.closest('.btnArea-my')) {
        if (activeButton) {
            activeButton.classList.remove('btn-active');
            activeButton = null;
        }
    }
});

