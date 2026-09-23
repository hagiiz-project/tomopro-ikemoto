/* =========================================================
   サイト全体の設定
   ここを書き換えるだけで、全ページに反映されます。
   ========================================================= */

window.SITE = {

  // 代表者名（全ページの署名に入ります）
  REP_NAME: "〔お名前〕",

  // 寄付ボタンの飛び先（東北大学基金）
  DONATE_URL: "https://www.kikin.tohoku.ac.jp/project/tomopro/2026/pj_009_2026",

  // 宮岸プロジェクトのページ
  PROJECT_URL: "https://taichi-miya.github.io/hagiiz-tomopro2026/",

  // researchmap（空欄ならリンクは表示されません）
  RESEARCHMAP_URL: "",

  // トップページの挨拶動画
  //   YouTubeの場合： { type: "youtube", id: "動画ID" }
  //     例）https://www.youtube.com/watch?v=abc123XYZ → id: "abc123XYZ"
  //   ファイルの場合： { type: "file", src: "video/greeting.mp4" }
  //   空欄の場合は、images/top/video-poster.jpg が表示されます
  VIDEO: { type: "youtube", id: "" },

  // true：画像がまだ無い場所に、置くべきファイル名を表示します（制作中）
  // false：公開時はこちら。ファイル名を出さず、地模様だけを表示します
  SHOW_IMAGE_LABELS: true,

  // 資金使途（3ページ共通）
  FUNDS: [
    "300万円は、以下に充当します。",
    "宮岸プロジェクトのボードゲーム製造・教材開発費。\n「ぼうさい女子会アプリ」および教材プラットフォーム「プリズム」のシステム開発費。\n学会発表および査読あり論文の投稿費用。",
    "調達額に応じて、ステージを解放します。"
  ],

  STAGES: [
    {
      amount: "100万円",
      title: "宮岸プロジェクト製品化 ＆ HagiiZ基盤構築",
      text: "ボードゲームの量産化。出前授業の製造・実施費用。"
    },
    {
      amount: "200万円",
      title: "「ぼうさい女子会」＆「プリズム」アップデート",
      text: "匿名相談窓口アプリの本格開発・サーバー維持費。「プリズム」のコンテンツ拡充。"
    },
    {
      amount: "300万円",
      title: "再現モデルの全国・世界への発信",
      text: "査読あり論文の投稿。学会発表。教材・マニュアルの全国無償展開システム構築費。",
      goal: true
    }
  ]
};
