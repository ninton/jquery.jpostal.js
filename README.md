# jquery.jpostal.js

[![寄付](https://www.ninton.co.jp/wordpress/wp-content/uploads/2019/06/donate.jpg)](https://www.ninton.co.jp/donate)

Copyright 2014-, Aoki Makoto, Ninton G.K.  
[http://www.ninton.co.jp](http://www.ninton.co.jp)

Released under the MIT license - http://en.wikipedia.org/wiki/MIT_License

Requirements  
jquery.js

郵便番号を入力すると住所欄へ自動入力するjQueryプラグインです。

jpostal-1006.appspot.comで公開していますので、jquery.jpostal.jsやjson/*.jsonを設置する必要がありません。

サイト運営者の定期的な郵便データ更新作業も必要ありません。

npmで、jquery-jpostal-jaとして公開しました。

npmでの使い方は最後。

都道府県をSELECTタグで表示する場合、OPTIONタグのvalueは次のどれでもかまいません。

    <option value="北海道">北海道</option>
    <option value="1">北海道</option>
    <option value="01">北海道</option>


## 使用例

(sample_1.html)

    <script type="text/javascript" src="//code.jquery.com/jquery-2.1.0.min.js"></script>
    <script type="text/javascript" src="//jpostal-1006.appspot.com/jquery.jpostal.js"></script>
    <script type="text/javascript">
    $(window).ready( function() {
      $('#postcode1').jpostal({
        postcode : [
          '#postcode1',
          '#postcode2'
        ],
        address : {
          '#address1'  : '%3',
          '#address2'  : '%4',
          '#address3'  : '%5'
        }
      });
    });


## 設置方法A


### 1 住所入力フォームにjquery本体とjquery.jpostal.jsをインクルードしてください。

例

    <script type="text/javascript" src="//code.jquery.com/jquery-2.1.0.min.js"></script>
    <script type="text/javascript" src="//jpostal-1006.appspot.com/jquery.jpostal.js"></script>

### 2 jpostalプラグイン呼び出しを記述してください。

#### 2-1. .jpostalを指定するセレクタ

    $('#postcode1').jpostal({

郵便番号欄のセレクタを指定してください。
郵便番号欄が2個の場合は、最初の1個だけを指定してください。
DOM idを設定していたほうが指定が簡単です。

例1

DOM idありの場合

    <input id="postcode1_1" name="postcode1" />
    $('#postcode1_1').jpostal({

例2

DOM idなしの場合

    <input name="postcode1" />
    $('[name=postcode1]').jpostal({

#### 2-2. 引数

##### postcode	郵便番号欄

郵便番号欄セレクタの配列
	
例1

郵便番号欄が1個

    postcode : [
      '#postcode'
    ]

例2

郵便番号欄が2個

    postcode : [
      '#postcode1',
      '#postcode2'
    ]
			
##### address	住所欄

住所欄セレクタと入力項目フォーマットの連想配列

入力項目フォーマット

| 書式 | 意味 |
-----|-----
| %3 | 都道府県 |
| %4 | 市区町村 |
| %5 | 町域 |
| %6 | 大口事業所の番地 |
| %7 | 大口事業所の名称 |
| %8 | 都道府県カナ |
| %9 | 市区町村カナ |
| %10 | 町域カナ(予定) |
	
例1

都道府県欄、住所欄の2個

    address : {
      '#prefecture'  : '%3',
      '#address'     : '%4%5',
    }

例2

都道府県欄、住所欄、番地欄の3個

    address : {
      '#prefecture'  : '%3',
      '#address1'    : '%4',
      '#address2'    : '%5',
    }


## 設置方法B

ご自分のサーバに郵便データを設置する場合


### 1. jquery.jpostal.jsをサーバに設置してください。

* アップロード先は任意です。
* htmlフォームと違うサーバも可能です。

アップロード先の例1

    js/jpostal/jquery.jpostal.js

アップロード先の例2

    js/jquery.jpostal.js
  
### 2. json/*.json をサーバにアップロードしてください。

* アップロード先は任意です。
* jquery.jpostal.jsとの相対関係はありません。
* htmlフォーム、jquery.jpostal.jsと違うサーバでもかまいません。

アップロード先の例1

    js/jpostal/json/*.json

アップロード先の例2

    js/json/*.json

### 3. 住所入力フォームにjquery本体とjquery.jpostal.jsをインクルードしてください。

例

    <script type="text/javascript" src="//code.jquery.com/jquery-2.1.0.min.js"></script>
    <script type="text/javascript" src="js/jquery.jpostal.js"></script>

### 4. jpostalプラグイン呼び出しを記述してください。

#### 4-1. .jpostalを指定するセレクタ

2-1. .jpostalを指定するセレクタを参照


#### 4-2. 引数

##### postcode
2-2. 引数を参照

##### address

2-2. 引数を参照

##### url		json/*.jsonのURL

住所フォームからjson/*.jsonへの相対URLまたは絶対URL。

http用、https用を指定してください。

例1

    url : {
      'http'  : 'json/',
      'https' : 'json/'
    }

例2

    url : {
      'http'  : 'http://www.example.jp/json/',
      'https' : 'https://ssl.example.jp/mysite/json/'
    }

例3

http、https どちらも同じホストとパスの場合

    url : {
      'http'  : '//www.example.jp/json/',
      'https' : '//www.example.jp/json/'
    }


## npm 使用例

### サンプルファイル

* test_npm/sample_1.html
* test_npm/src/main.js

### インストール

プロジェクトディレクトリで、jqueryとjquery-jpostal-jaをインストールしてください。

jquery-jpostal-jaをinstallしただけでは、jqueryを自動installされませんので、明示的にjqueryをinstallしてください。

    $ npm install jqeury
    $ npm install jquery-jpostal-ja

### main.jsの例

    $ = require('jquery');
    require('jquery-jpostal-ja');
    
      $(window).ready( function() {

        $('#postcode1').jpostal({   
          postcode : [
            '#postcode1',
            '#postcode2'
          ],
          address : {
            '#address1'  : '%3',
            '#address2'  : '%4',
            '#address3'  : '%5',
            '#address1_kana'  : '%8',
            '#address2_kana'  : '%9',
            '#address3_kana'  : '%10'
          }
      });
    });


### htmlの例

    <script type="text/javascript" src="build/build.js"></script>


### ビルドの例

    $ browserify src/main.js -o build/build.js

