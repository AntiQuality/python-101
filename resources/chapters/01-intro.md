---
slug: intro
title: 变量与数据类型
order: 1
description: 学习如何在 Python 中声明变量，理解 int、float、str、bool 等基础数据类型。
---

## 变量是什么？
变量可以看作带名字的盒子，用来临时存放需要在程序中反复使用的数据。Python 会根据赋值自动决定变量的类型。

## 常见数据类型
- `int`：整数，例如 `18`
- `float`：小数，例如 `3.14`
- `str`：字符串，例如 `"hello"`
- `bool`：布尔值，只有 `True` 或 `False`

```python
age = 18
price = 3.5
name = "小明"
is_student = True
```

## 常见错误
- 变量名不能以数字开头。
- 大小写敏感：`Name` 与 `name` 是不同的变量。

## 进阶拓展
- 使用 `type()` 可以查看变量类型。
- Python 3.8+ 支持海象运算符 `:=`，可在表达式中为变量赋值。
