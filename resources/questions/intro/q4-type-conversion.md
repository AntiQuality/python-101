---
slug: q4-type-conversion
chapter: intro
difficulty: 进阶
type: 单选题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
咖啡店的系统接收到字符串形式的输入价格 `"28.5"`，如果想把它转换成可以参与计算的小数，应该使用哪种方式？
- A. `int("28.5")`
- B. `float("28.5")`
- C. `str(28.5)`
- D. `bool("28.5")`

### 正确答案
B

### 解析
`float()` 可以将字符串转换为浮点数，便于后续加减计算。

### 常见错误
- 误用 `int()`，会抛出 `ValueError`，因为字符串中含有小数点。
- 忽略类型转换，直接参与计算导致类型错误。

### 进阶拓展
处理金额时可考虑使用 `decimal.Decimal`，避免浮点误差。
