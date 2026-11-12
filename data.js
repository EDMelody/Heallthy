// 每天将新记录追加到 records；缺失时写 null，页面会用相邻有效数据线性插值并标记。
// receivedAt 仅作后台元数据，记录收到该条体重的时间（ISO 8601，含时区），页面不展示。
// 历史记录未提供具体收到时刻时，receivedAt 留空，不推测补录。
window.WEIGHT_DATA = {
  people: ["丢丢", "香香", "嘟宝"],
  records: [
    { date: "2026-11-12", person: "丢丢", morning: 134.7, evening: null, receivedAt: "2026-11-12T16:37:37+08:00" },
    { date: "2026-11-12", person: "香香", morning: 196.7, evening: null, receivedAt: "2026-11-12T16:37:37+08:00" },
    { date: "2026-11-12", person: "嘟宝", morning: 105.0, evening: null, receivedAt: "2026-11-12T16:37:37+08:00" },
    { date: "2026-11-11", person: "丢丢", morning: 134.1, evening: 136.2, receivedAt: "2026-11-11T16:35:10+08:00", eveningReceivedAt: "2026-11-11T22:27:46+08:00", eveningCorrectedAt: "2026-11-11T22:56:28+08:00" },
    { date: "2026-11-11", person: "香香", morning: 196.0, evening: 199.4, receivedAt: "2026-11-11T16:35:10+08:00", eveningReceivedAt: "2026-11-11T22:27:46+08:00", eveningCorrectedAt: "2026-11-11T23:50:42+08:00" },
    { date: "2026-11-11", person: "嘟宝", morning: 105.2, evening: 107.1, receivedAt: "2026-11-11T16:35:10+08:00", eveningReceivedAt: "2026-11-11T22:27:46+08:00" },
    { date: "2026-11-10", person: "丢丢", morning: 134.8, evening: 135.2, receivedAt: "2026-11-10T09:52:02+08:00", eveningReceivedAt: "2026-11-11T00:01:50+08:00" },
    { date: "2026-11-10", person: "香香", morning: 194.9, evening: 197.3, receivedAt: "2026-11-10T09:52:02+08:00", eveningReceivedAt: "2026-11-11T00:01:50+08:00" },
    { date: "2026-11-10", person: "嘟宝", morning: 105.6, evening: 107.2, receivedAt: "2026-11-10T09:52:02+08:00", eveningReceivedAt: "2026-11-11T00:01:50+08:00" },
    { date: "2026-11-09", person: "丢丢", morning: 134.5, evening: 136.7 },
    { date: "2026-11-09", person: "香香", morning: 195.1, evening: 196.5 },
    { date: "2026-11-09", person: "嘟宝", morning: 105.8, evening: 106.7 },
    { date: "2026-11-08", person: "香香", morning: 195.7, evening: 197.1 },
    { date: "2026-11-08", person: "丢丢", morning: 137.1, evening: 135.8 },
    { date: "2026-11-08", person: "嘟宝", morning: 106.0, evening: 107.1 }
  ]
};
