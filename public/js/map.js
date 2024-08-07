let map; // 전역 변수로 맵 객체를 선언
let markers = []; // 전역 변수로 마커 배열을 선언
// 마커 이미지의 이미지 주소입니다
var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png"; 

function initMap() {
    const container = document.getElementById('map');
    const options = {
        center: new kakao.maps.LatLng(37.5665, 126.9780), // 초기 중앙 위치를 서울로 설정
        level: 8
    };
    map = new kakao.maps.Map(container, options);
}

function showMarkers(locations) {
    const positions = locations.map(location => ({
        content: `
            <div style="padding:5px;">
            ${location.centername}! <br>
            <a href="https://map.kakao.com/link/map/${encodeURIComponent(location.centername)},${location.latitude},${location.longitude}" style="color:blue" target="_blank">큰지도보기</a> 
            <a href="https://map.kakao.com/link/to/${encodeURIComponent(location.centername)},${location.latitude},${location.longitude}" style="color:blue" target="_blank">길찾기</a>
            </div>`,
        latlng: new kakao.maps.LatLng(parseFloat(location.latitude), parseFloat(location.longitude))
    }));

    let sumLat = 0;
    let sumLng = 0;

    positions.forEach(position => {
        sumLat += position.latlng.getLat();
        sumLng += position.latlng.getLng();
    });

    const avgLat = sumLat / positions.length;
    const avgLng = sumLng / positions.length;

    // 지도 중심을 검색된 위치의 중앙으로 이동
    map.setCenter(new kakao.maps.LatLng(avgLat, avgLng));

    // 기존 마커를 모두 제거
    removeMarkers();

    // 새로운 마커를 지도에 추가
    positions.forEach(position => {
        const marker = new kakao.maps.Marker({
            map: map,
            position: position.latlng
        });

        const infowindow = new kakao.maps.InfoWindow({
            content: position.content
        });

        let infowindowOpen = false; // 인포윈도우 열림 상태를 저장하는 변수
        // 클릭 시 인포윈도우 열기 및 닫기
        kakao.maps.event.addListener(marker, 'click', () => {
            if (infowindowOpen) {
                infowindow.close();
            } else {
                infowindow.open(map, marker);
            }
            infowindowOpen = !infowindowOpen; // 상태 토글
        });

        markers.push(marker); // 마커 배열에 추가
    });
}

// 기존 마커를 모두 제거하는 함수
function removeMarkers() {
    markers.forEach(marker => marker.setMap(null));
    markers = [];
}

// 페이지 로드 시 초기 맵을 생성
window.onload = initMap;

