# gsimaps-vector-experiment-simplified

このレポジトリの目的は以下の通りです。

- <https://github.com/gsi-cyberjapan/gsimaps-vector-experiment/> の独自形式のスタイルデータを [Style Specification version 8](https://docs.mapbox.com/mapbox-gl-js/style-spec/) に変換して提供
- 変換されたスタイルをもとにエラーなく地図表示できるようにするための、最小限の HTML (+Javascript) の提供

## 変換

変換結果は `data` フォルダに格納しています。

変換方法は以下の通りです。

- <https://frogcat.github.io/gsimaps-vector-experiment/> を開く
- 適当な地図を選択
- 画面右上のメニューに `Export Style.json` というメニューが追加されているので、これをクリックすると style.json がダウンロードされる

`Export Style.json` は単純に以下のコードを実行するだけのものです。`GSIBV.application._map._map` が mapbox-gl-js の Map インスタンスのようなので、これの [getStyle()](https://docs.mapbox.com/mapbox-gl-js/api/#map#getstyle) をコールすることで style.json を得ます。

```js
var style = GSIBV.application._map._map.getStyle();
MA.saveFile("style.json","application/json",JSON.stringify(style,null,2));
break;
```

## デモ

- <https://frogcat.github.io/gsimaps-vector-experiment-simplified/>

本来最小構成であればこんなコードで地図が表示されるはずです。

```js
var map = new mapboxgl.Map({
  container: 'map',
  center: [135, 35],
  zoom: 5,
  hash: true,
  style: 'data/std.json'
});
```

ただ、実際には不具合が出るので、以下のようにプラグインの追加と styledata イベントのハンドラーを追加が必要でした。

```js
mapboxgl.setRTLTextPlugin('https://gsi-cyberjapan.github.io/gsimaps-vector-experiment/mapbox-rtlplugin/vertical-text.js');
var map = new mapboxgl.Map({
  container: 'map',
  center: [135, 35],
  zoom: 5,
  hash: true,
  style: 'data/std.json'
}).on("styledata", helper.onStyleData);
```

### 1.縦書き

一部の注記が `<gsi-vertical>ほげほげ</gsi-vertical>` のように、マークアップされた状態で表示されるので、
以下のコードで縦書きプラグインを導入して対処しています。

```js
mapboxgl.setRTLTextPlugin('https://gsi-cyberjapan.github.io/gsimaps-vector-experiment/mapbox-rtlplugin/vertical-text.js');
```

### 2.スプライト

そのままだと地図上のアイコンが表示されません。 console を見ると map.setImage か sprite 設定をせよ、との指示が。
style.json には sprite の設定がないので、 style.json を編集するというのは一つの手段なのですが、
実は一部のスタイルでは複数のスプライトをロードする必要があるようなので sprite 設定はうまくいきません。

初回に必要なスプライトをすべてロードして map.setImage することで対処しています。

### 3.ハッチング

ポリゴンの塗りつぶしにハッチングが使われている箇所があるのですが、これはそのままだと表示されません。
ハッチングのための画像 ID は以下のようなパターンを持っているようです。


```
-gsibv-hatch-{type}-{size}-{r},{g},{b},{a}-
or
-gsibv-hatch-{type}-{size}-{r},{g},{b},{a}-{r},{g},{b},{a}
```

参考 : <https://github.com/gsi-cyberjapan/gsimaps-vector-experiment/blob/master/js/src/map/hatch-imagemanager.js>

style.json をロードした後に中身をスキャンして、このパターンの画像IDに対応する ImageData を生成登録して対処しています。


## ToDo

- ほかにも表示上の不具合を見つけたら対策する
