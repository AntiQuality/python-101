---
title: 变量类型选择
slug: q1-variable
chapter: intro
difficulty: 基础
type: 单选题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
小美想在应用里保存正在阅读书籍的页码，应该选择哪种 Python 数据类型来存储这个数字？
- A. str
- B. int
- C. list
- D. bool

### 正确答案
B

### 解析
整数 `int` 适合表示页码这类可直接参与加减运算的数量。

### 常见错误
误选 `str`，会让页码变成字符串，无法参与比较和数学运算。

### 进阶拓展
阅读进度还可以结合浮点数（例如 `0.5` 表示读到一半）或字典保存更多信息。
