---
slug: conditionals
title: 条件语句 if/elif/else
order: 2
description: 学会使用 if 语句根据条件执行不同的代码块。
---

## if 语句结构
```python
temperature = 28
if temperature > 30:
    print("天气有点热，记得多喝水！")
elif temperature < 10:
    print("出门要穿外套～")
else:
    print("今天的天气刚刚好！")
```

## 注意
- 冒号 `:` 后面必须缩进。
- Python 使用缩进而不是大括号来划分代码块。

## 常见错误
- 混用 Tab 和空格导致缩进错误。
- 条件表达式忘记写比较运算符，例如将 `if temperature` 误写为 `if temperature = 30`。

## 进阶拓展
- 逻辑运算符 `and`, `or`, `not` 可以组合多个条件。
- Python 中没有 switch 语句，通常使用字典映射或 if 链替代。
