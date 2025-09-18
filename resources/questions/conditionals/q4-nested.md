---
title: 嵌套条件
slug: q4-nested
chapter: conditionals
difficulty: 进阶
type: 判断题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
判断正误：嵌套 `if` 语句可以通过缩进层级区分内部结构，外层条件为假时，内层代码不会执行。
- 正确
- 错误

### 正确答案
正确

### 解析
嵌套结构通过缩进控制执行顺序，只有外层条件成立时才会继续判断内部条件。

### 常见错误
忽略缩进导致逻辑混乱，使外层条件与内层条件失去关联。

### 进阶拓展
可以用早返回或字典映射简化复杂的嵌套 `if`。
