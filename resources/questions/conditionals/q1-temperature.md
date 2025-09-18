---
title: AQI 判断
slug: q1-temperature
chapter: conditionals
difficulty: 进阶
type: 判断题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
判断正误：在 Python 中，`if` 语句只有当条件为 `True` 时才会执行缩进块中的代码，如果条件为整数 `0`，则视为 `False`。
- 正确
- 错误

### 正确答案
正确

### 解析
Python 会将 `0` 视为布尔上下文中的 `False`，因此 `if 0:` 不会执行代码块。

### 常见错误
把 `0` 和 `False` 误认为不同逻辑，忽略了 Python 的真值测试规则。

### 进阶拓展
除了 `0` 之外，`None`、空字符串、空列表等也会被视为 `False`。
