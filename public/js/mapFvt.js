// 마커를 생성하는 함수
export function favoriteMarkers(fvtLocations) {
    // 모든 위치의 위도와 경도를 추출합니다.
    const latitudes = fvtLocations.map(location => parseFloat(location.latitude));
    const longitudes = fvtLocations.map(location => parseFloat(location.longitude));

    // 위도와 경도의 평균값을 구합니다.
    const avgLatitude = latitudes.reduce((sum, lat) => sum + lat, 0) / latitudes.length;
    const avgLongitude = longitudes.reduce((sum, lon) => sum + lon, 0) / longitudes.length;

    // 맵의 중앙값을 계산하여 중심좌표로 설정합니다.
    var mapContainer = document.getElementById('map'); // 지도를 표시할 div  
    var mapOption = {
        center: new kakao.maps.LatLng(avgLatitude, avgLongitude), // 계산된 중심좌표
        level: 8 // 지도의 확대 레벨
    };
    console.log(fvtLocations);
    var map = new kakao.maps.Map(mapContainer, mapOption); // 지도를 생성합니다

    // fvtLocations 데이터를 기반으로 마커를 표시할 위치와 title 객체 배열을 만듭니다
    var positions = fvtLocations.map(location => ({
        title: location.centername,
        latlng: new kakao.maps.LatLng(parseFloat(location.latitude), parseFloat(location.longitude))
    }));

    // 마커 이미지의 이미지 주소입니다
    var imageSrc = "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

    for (var i = 0; i < positions.length; i++) {

        // 마커 이미지의 이미지 크기 입니다
        var imageSize = new kakao.maps.Size(24, 35);

        // 마커 이미지를 생성합니다    
        var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize);

        // 마커를 생성합니다
        var marker = new kakao.maps.Marker({
            map: map, // 마커를 표시할 지도
            position: positions[i].latlng, // 마커를 표시할 위치
            title: positions[i].title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
            image: markerImage // 마커 이미지 
        });
    }
}

