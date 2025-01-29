// オブジェクト
var map;

// 中心点の緯度経度（東京駅）
const lat = 35.669055759072684, lng = 139.75864681491296;

// マーカーを表示する関数
function showMarker(origin, destination) {
    const markerArr = [origin, destination];
    const pinStyles = [ZDC.MARKER_COLOR_ID_RED_L, ZDC.MARKER_COLOR_ID_GREEN_L]; // 出発地点と目的地のマーカースタイル

    markerArr.forEach((location, index) => {
        // マーカーを作成して地図に追加
        const marker = new ZDC.Marker(
            new ZDC.LatLng(location.lat, location.lng), // マーカーの位置
            { styleId: pinStyles[index] }              // マーカースタイル
        );
        map.addWidget(marker); // マーカーを地図に追加
    });
}

function showRouteInfo(distance, duration) {
    const time_info_area = document.getElementById('time');
    const dist_info_area = document.getElementById('dist');

    time_info_area.textContent = duration + '分';
    dist_info_area.textContent = distance + 'm';
}

// ルート検索を実行する関数
function performRouteSearch(origin, destination) {
    const startPoint = `${origin.lng},${origin.lat}`;
    const goalPoint = `${destination.lng},${destination.lat}`;
    const api = "/route/route_mbn/drive_tsp";
    const params = {
        search_type: 1,
        from: startPoint,
        to: goalPoint,
    };

    try {
        map.requestAPI(api, params, function (response) {
            if (response.ret && response.ret.status === 'OK') {

                // ルート詳細を抽出
                const route = response.ret.message.result.item[0].route;
                console.log(response);
                const distance = route.distance
                const duration = route.time
                showRouteInfo(distance, duration);

                // 各リンクの座標を抽出
                const coordinates = route.section[0].link.flatMap(link =>
                    link.line.coordinates.map(coord => new ZDC.LatLng(coord[1], coord[0]))
                );

                // 抽出した座標でポリラインを作成
                const polyline = new ZDC.Polyline(coordinates, {
                    color: 'red',
                    width: 4,
                    pattern: 'solid',
                    opacity: 0.7
                });

                // ポリラインを地図に追加
                map.addWidget(polyline);
            } else {
                console.error("ルート検索失敗");
            }
        });
    } catch (error) {
        console.error("ルート検索中にエラーが発生しました:", error);
    }
}

// ZMALoaderを初期化
ZMALoader.setOnLoad(function (mapOptions, error) {
    if (error) {
        console.error(error);
        return;
    }
    mapOptions.mouseWheelReverseZoom = true;
    mapOptions.tiltable = true;
    mapOptions.center = new ZDC.LatLng(lat, lng); // 中心点の緯度経度を設定

    // 地図を生成
    map = new ZDC.Map(
        document.getElementById('ZMap'),
        mapOptions,
        function () {
            const origin = new ZDC.LatLng(35.681406, 139.767132); // 東京駅
            const destination = new ZDC.LatLng(35.658711231010265, 139.74543289660156); // 東京タワー

            performRouteSearch(origin, destination); // ルート検索を実行
            showMarker(origin, destination);        // マーカーを表示
        },
        function () {
            console.log("APIエラー");
        }
    );
});
