---
title: Break 行为
slug: q2-password
chapter: loops
difficulty: 基础
type: 判断题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
判断正误：在 `while` 循环中使用 `break` 可以立即终止循环，即使条件仍为真。
- 正确
- 错误

### 正确答案
正确

### 解析
`break` 会直接跳出当前层循环，常用于收到特定输入或达到目标时终止循环。

### 常见错误
- 将 `break` 与 `continue` 混淆，导致循环无法结束。

### 进阶拓展
结合 `else` 子句可以在循环未被 `break` 打断时执行额外逻辑。
