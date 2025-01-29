# Google Maps API と Zenrin Maps API の比較：最適なルート検索の実装

こんにちは！今回は、Google Maps API と Zenrin Maps API を使用して、最適なドライブルートを計算し、表示するプロジェクトについて紹介します。両者の API を比較し、それぞれのコードを解説します。

## プロジェクトの概要

このプロジェクトでは、出発地と目的地を指定し、最適なドライブルートを計算するアプリケーションを作成しました。Google Maps API と Zenrin Maps API の両方を使用して、ルート検索と表示を行います。以下に、それぞれの API の実装方法とコードを紹介します。

---

## Google Maps API の実装

Google Maps API は、ルート検索と地図表示を簡単に実装できる強力なツールです。以下は、Google Maps API を使用してルートを計算し、表示するコードです。

### コード例

```javascript
// Google Maps APIを使用したルート検索
function initMap() {
  const origin = "35.658711231010265, 139.74543289660156"; // 出発地
  const destination = "35.681406, 139.767132"; // 目的地
  const waypoints = [
    { location: "35.68985058924021, 139.70058200790456", stopover: true }, // 経由地1
    { location: "35.71418344492873, 139.7774129687794", stopover: true }, // 経由地2
  ];

  const map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 35.6895, lng: 139.6917 }, // 東京の座標
    zoom: 13,
  });

  const directionsService = new google.maps.DirectionsService();
  const directionsRenderer = new google.maps.DirectionsRenderer({
    map: map,
    polylineOptions: { strokeColor: "green", strokeWeight: 6 },
  });

  directionsService.route(
    {
      origin: origin,
      destination: destination,
      waypoints: waypoints,
      optimizeWaypoints: true, // 経由地を最適化
      travelMode: google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
        const distance = response.routes[0].legs[0].distance.text;
        const duration = response.routes[0].legs[0].duration.text;
        showRouteInfo(distance, duration); // ルート情報を表示
      } else {
        console.error("ルート検索に失敗しました: " + status);
      }
    }
  );
}
```
