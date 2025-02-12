# GoogleMapsAPI と ZENRINMapsAPI の最適巡回ルート比較してみた

# 要約

本記事では、Google Maps API と Zenrin Maps API を使用し、両 API の最適巡回ルートを比較します。具体的には、新宿駅を始点、
東京タワーを終点とし、その間の経由地点として浅草寺、東京スカイツリー、上野動物園をランダムな順番で設定しました。この設定で、
両 API がルート情報と経由地点を最適な順番で返してくれるかを検証します。<br>

Google Maps API では、Directions API のパラメータ optimizeWaypoints を true に設定することで、経由地の最適な順序を自動的に計算し、最適なルートを提供します。<br>

一方、Zenrin Maps API の route_mbn や drive_tsp エンドポイントを使用することで、複数の経由地を考慮した最適な巡回ルートを取得できます。

## はじめに

ルート最適化を行う際、どの API を選択するかはプロジェクトの成功に大きな影響を与えます。本記事では、**Google Maps API（Directions API）** と **Zenrin Maps API（route_mbn/drive_tsp）** の特性を比較し、それぞれの技術的特徴や適用例について詳しく解説します。特に、経由地点数の上限やデータの精度を考慮し、どの API がどのようなユースケースに適しているかを分析します。

## 1. API の概要

### 1.1 Google Maps API（Directions API）

Google Maps API の **Directions API** は、複数の地点間で最適ルートを計算し、詳細な経路情報を提供するサービスです。世界規模でのルート検索に対応し、車両、徒歩、自転車、公共交通機関などの移動モードをサポートしています。リアルタイムの交通情報を考慮したルート検索が可能であり、動的なルート変更にも対応します。ただし、**指定できる経由地点数の上限は 25 点（始点と終点を含む）** であり、大規模な巡回ルートには制約があります。

### 1.2 Zenrin Maps API（route_mbn/drive_tsp）

Zenrin Maps API の **route_mbn/drive_tsp**（自動車ルート検索 2.0 - 最適巡回考慮）は、日本国内向けに特化したルート検索 API です。Zenrin の詳細な地図データを活用し、日本国内の一方通行、交通規制、標高データを考慮した高精度なルート計算が可能です。特に、**指定できる経由地点数の上限は 30 点** となっており、Google Maps API よりも多くの経由地点を設定できます。このため、物流業や訪問先の多い配送業務などに最適です。

## 2. API キーの取得

- ### 2.1 Google MAPS API キーの取得方法

  [参考サイト](https://qiita.com/Haruka-Ogawa/items/997401a2edcd20e61037 "Google APIキーの取得")

- ### 2.2 Zenrin MAPS API キーの取得方法

  #### 検証用 ID とパスワード（PW）取得

  ZENRIN Maps API を使用するためには、検証用 ID と PW を取得しなければなりません。<br>
  必要事項を入力して送信し、お試し ID は下記からで簡単に発行できました。（2 か月無料でお試しできます）<br>
  [ZENRIN Maps API 無料お試し ID お申込みフォーム](https://www.zenrin-datacom.net/solution/zenrin-maps-api/trial?fm_cp=6757baf3203e3a00bb118509&fm_mu=676391df1fd14c04c9cd1083&utm_campaign=6757baf3203e3a00bb118509&utm_medium=else&utm_source=Qiita9 "Zenrin APIキーの取得フォーム")<br>
  ![お申込みフォーム](https://github.com/orion8-dev/maps-route-comparison/blob/main/imgRef/form.png "form")

#### 検証用 ID と PW の確認

フォーム送信から 3 営業日以内にメールにて検証用 ID と PW が発行されます。
[参考サイト](https://qiita.com/goldie9/items/1983bf8c4ad796290cbf "Zenrin APIキーの取得")でコンソール内の設定、API キーや認証方式を設定してください。

## 3. API の設定方法

### 3.1 Google Maps API の設定

Google Maps API を利用し地図描画するには、以下のスクリプトを HTML に追加し、`[YOUR_API_KEY]`を修得した API キーに書き換えし設定します。

```html
<script
  src="https://maps.googleapis.com/maps/api/js?key=[YOUR_API_KEY]&callback=initMap"
  defer
></script>
```

### 3.2 Zenrin Maps API の設定

Zenrin Maps API を使用し地図描画するには、以下のスクリプトを HTML に追加し`[YOUR_API_KEY]`に API キーと`[認証方式]`にコンソールで設定した認証方式を設定します。

- ### 参考サイト　[ZENRIN Maps API ディベロッパーズサイト](https://developers.zmaps-api.com/v20/reference/javascriptAPI/sample/map_center.html "ZENRIN Maps API ディベロッパーズサイト")

```html
<script src="https://test-js.zmaps-api.com/zma_loader.js?key=[YOUR_API_KEY]&auth=[認証方式]"></script>
```

## 4. コードの比較

### ルート最適化の実装方法

### 4.1 Google Maps API（Directions API）

```javascript
/**
 * マップを初期化し、ルートを表示する関数
 */
async function initMap() {
  // 出発地、目的地、経由地を定義
  const origin = { lat: 35.690881942542795, lng: 139.6996382651929 }; // 新宿駅
  const destination = { lat: 35.658711231010265, lng: 139.74543289660156 }; // 東京タワー
  const waypoints = [
    {
      location: { lat: 35.71480344840882, lng: 139.7966564581166 },
      stopover: true,
    }, // 浅草寺
    {
      location: { lat: 35.71017592344799, lng: 139.81071112543816 },
      stopover: true,
    }, // 東京スカイツリー
    {
      location: { lat: 35.716797251823365, lng: 139.7729444161881 },
      stopover: true,
    }, // 上野動物園
  ];

  // マップを東京中心に初期化
  map = new google.maps.Map(document.getElementById("map"), {
    center: origin,
    zoom: 12,
  });

  // DirectionsService と DirectionsRenderer を設定
  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    polylineOptions: {
      strokeColor: "green", // ルートの色を緑に設定
      strokeWeight: 6, // 線の太さ
      strokeOpacity: 0.8, // 線の不透明度
    },
  });

  // 最適化された経由地でルートをリクエスト
  directionsService.route(
    {
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(response);
        const routeLegs = response.routes[0].legs;
        const totalDistance = routeLegs.reduce(
          (sum, leg) => sum + leg.distance.value,
          0
        );
        const totalDuration = routeLegs.reduce(
          (sum, leg) => sum + leg.duration.value,
          0
        );
        displayRouteInfo(totalDistance, totalDuration);
      } else {
        // エラーハンドリング
        console.error("ルートリクエストに失敗しました: " + status);
        document.getElementById("route-info").textContent =
          "ルートを計算できません。再試行してください。";
      }
    }
  );
}
```

#### レスポンス結果（Directions API）

![GOOGLE Directions API レスポンス結果](https://github.com/orion8-dev/maps-route-comparison/blob/main/imgRef/gResponse.png "レスポンス結果")

#### 地図上ルート描画

<br>![ルート描画](https://github.com/orion8-dev/maps-route-comparison/blob/main/imgRef/gRoute.png "ルート描画")

### 4.2 Zenrin Maps API（route_mbn/drive_tsp）

```javascript
// マップオブジェクトと中心座標の設定
var map;
// 経由地の座標をカンマ区切りの文字列で定義
let waypointString =
  "139.7966564581166,35.71480344840882,139.81071112543816,35.71017592344799,139.7729444161881,35.716797251823365";
// ZMALoaderの初期化
ZMALoader.setOnLoad(function (mapOptions, error) {
  if (error) {
    console.error(error);
    return;
  }
  mapOptions.center = new ZDC.LatLng(mapCenter.lat, mapCenter.lng);
  mapOptions.zoom = 13;
  mapOptions.centerZoom = false; // ★地図の中心点を中心に拡大縮小する指定
  mapOptions.mouseWheelReverseZoom = true;
  mapOptions.minZoom = 4.5;

  map = new ZDC.Map(
    document.getElementById("ZMap"),
    mapOptions,
    function () {
      const origin = new ZDC.LatLng(35.690881942542795, 139.6996382651929); // 新宿駅
      const destination = new ZDC.LatLng(
        35.658711231010265,
        139.74543289660156
      ); // 東京タワー
      performRouteSearch(origin, destination, waypointString);

      map.addControl(new ZDC.ZoomButton("bottom-left"));
      map.addControl(new ZDC.Compass("top-right"));
      map.addControl(new ZDC.ScaleBar("bottom-left"));
    },
    function () {
      console.log("APIエラー");
    }
  );
});

// ルート検索を実行する関数
function performRouteSearch(origin, destination, waypointString) {
  const startPoint = `${origin.lng},${origin.lat}`;
  const goalPoint = `${destination.lng},${destination.lat}`;
  const api = "/route/route_mbn/drive_tsp";
  const params = {
    search_type: 1,
    from: startPoint,
    to: goalPoint,
    waypoint: waypointString,
  };

  try {
    map.requestAPI(api, params, function (response) {
      if (response.ret && response.ret.status === "OK") {
        const route = response.ret.message.result.item[0].route;
        const coordinates = route.link.flatMap((link) =>
          link.line.coordinates.map(
            (coord) => new ZDC.LatLng(coord[1], coord[0])
          )
        );

        const bounds = calculatePolylineBounds(coordinates);
        if (bounds) {
          const adjustZoom = map.getAdjustZoom(coordinates, { fix: false });
          map.setCenter(adjustZoom.center);
          map.setZoom(adjustZoom.zoom - 0.5);
        }

        const routeorder = route.waypoint_order;
        const rawDuration = route.time;
        const rawDistance = route.distance;
        const waypoints = parseWaypoints(
          waypointString,
          origin,
          destination,
          routeorder
        );
        showMarker(waypoints);
        showRouteInfo(rawDuration, rawDistance);

        const polyline = new ZDC.Polyline(coordinates, {
          color: "red",
          width: 4,
          pattern: "solid",
          opacity: 0.7,
        });
        map.addWidget(polyline);
      } else {
        console.error("ルート検索に失敗しました。");
      }
    });
  } catch (error) {
    console.error("ルート検索中にエラーが発生しました:", error);
  }
}
```

#### レスポンス結果（自動車ルート検索 2.0(最適巡回考慮)）

![Zenrin Maps API レスポンス結果](imgRef\response.png "レスポンス結果")

#### 地図上ルート描画

- #### 地図描画[参照サイト](https://orion8-dev.github.io/maps-route-comparison/zmap.html "GitHub hosting link")

<br>![ルート描画](https://github.com/orion8-dev/maps-route-comparison/blob/main/imgRef/response.png "ルート描画")

## 5. 主要な関数の詳細

### 5.1 Google Maps API（Directions API）

- `directionsService.route()`: 最適ルートをリクエストし、検索結果を取得します。
- `DirectionsRenderer.setDirections()`: 取得したルートを地図上に描画します。
- `optimizeWaypoints: true`: 経由地の順序を最適化し、効率的なルートを計算します。
- `waypoints: waypoints`: 経路上の地点を示す配列です。リクエストがウェイポイントパラメーター内で optimize:true に渡された場合、このウェイポイントは並べ替えられることがあります。

  ```javascript
  const waypoints = [
    {
      location: { lat: 35.71480344840882, lng: 139.7966564581166 },
      stopover: true,
    }, // 浅草寺
    {
      location: { lat: 35.71017592344799, lng: 139.81071112543816 },
      stopover: true,
    }, // 東京スカイツリー
    {
      location: { lat: 35.716797251823365, lng: 139.7729444161881 },
      stopover: true,
    }, // 上野動物園
  ];
  ```

- `travelMode`: 交通手段（車両、徒歩、公共交通機関）を指定できます。

### 5.2 Zenrin Maps API（route_mbn/drive_tsp）

- `map.requestAPI()`: Zenrin の WebAPI を利用できます。GET リクエストのみ対応しており、ルート検索 API へリクエストを送信します。<br>
  ![Zenrin Maps JavaScript API](https://github.com/orion8-dev/maps-route-comparison/blob/main/imgRef\requestAPI.png "requesAPI レファレンス")
- `route_mbn/drive_tsp`: 最適巡回ルートの計算を実施します。
- `waypoint`: 経由地を指定し、巡回ルートの最適化を実現します。

## 6. ルートと経由地点の最適化を比較

| 　　　　　機能　　　 | 　　　　　　　　　　　　　　最適巡回　　　　　　　　　　　　　　 | 　所要時間　 | 　距離　 |
| -------------------- | ---------------------------------------------------------------- | ------------ | -------- |
| Google Maps API      | 新宿駅 ➡ 東京スカイツリー ➡ 浅草寺 ➡ 上野動物園 ➡ 東京タワー     | 1 時 10 分   | 36.1 km  |
| Zenrin Maps API      | 新宿駅 ➡ 上野動物園 ➡ 浅草寺 ➡ 東京スカイツリー ➡ 東京タワー     | 1 時 31 分   | 24.9 km  |

Google Maps API と Zenrin Maps API のルート提案に差が生じた要因として、高速道路の利用設定の違いが考えられます。具体的には、Google Maps API ではデフォルトで高速道路を利用するルートが提案される一方、Zenrin Maps API ではデフォルト設定が一般道路を優先して引き込む形になっています。そのため、Google Maps API の所要時間が短くなる傾向があります。

## 7. 機能比較

| 機能             | Google Maps API | Zenrin Maps API       |
| ---------------- | --------------- | --------------------- |
| グローバル対応   | ✅ はい         | ❌ いいえ（日本限定） |
| ルート最適化     | ✅ はい         | ✅ はい               |
| 交通情報         | ✅ はい         | ✅ はい               |
| データの精度     | ⚠️ 地域差あり   | ✅ 日本国内では高精度 |
| 一方通行考慮     | ⚠️ 一部         | ✅ 詳細な考慮あり     |
| 経由地点数の上限 | 25 点           | 30 点                 |

## 8. 結論

- **Google Maps API（Directions API）** は、**グローバルなルート検索とカスタマイズ性を重視するシナリオに適しています**。特に、国際展開を視野に入れたプロジェクトや、複数の交通手段を組み合わせた最適ルート検索を行う場合に有用です。
- **Zenrin Maps API（route_mbn/drive_tsp）** は、**日本国内におけるルート検索の精度が非常に高く、道路規制や交通ルールを詳細に反映したルートを提供できます**。また、**経由地点数の上限が 30 点と多いため、物流業務や観光向けナビゲーション、自治体向けの公共交通管理などに適用可能です。**。
- **日本国内において、より高精度で最適なルートを求める場合は、Zenrin Maps API の活用が推奨されます。**
