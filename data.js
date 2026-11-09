// 每天将新记录追加到 records；缺失时写 null，页面会用相邻有效数据线性插值并标记。
window.WEIGHT_DATA = {
  people: ["丢丢", "香香", "嘟宝"],
  records: [
    { date: "2026-11-09", person: "丢丢", morning: null, evening: null },
    { date: "2026-11-09", person: "香香", morning: 195.1, evening: null },
    { date: "2026-11-09", person: "嘟宝", morning: 105.8, evening: null },
    { date: "2026-11-08", person: "香香", morning: 195.7, evening: 197.1 },
    { date: "2026-11-08", person: "丢丢", morning: 137.1, evening: 135.8 },
    { date: "2026-11-08", person: "嘟宝", morning: 106.0, evening: 107.1 }
  ]
};
