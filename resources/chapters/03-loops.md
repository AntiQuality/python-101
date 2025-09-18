---
slug: loops
title: 循环与用户输入
order: 3
description: 学习 while 与 for 循环的使用方式，以及如何结合用户输入控制循环。
---

## while 循环
`while` 循环会在条件为 `True` 时持续执行代码。

```python
count = 0
while count < 3:
    print("欢迎光临 Python 咖啡馆！")
    count += 1
```

## for 循环
`for` 通常与可迭代对象搭配，例如列表或 `range()`。

```python
menu = ["拿铁", "美式", "抹茶拿铁"]
for item in menu:
    print(item)
```

## 用户输入与循环
将 `input()` 与循环结合可以实现持续交互：

```python
while True:
    command = input("请输入指令 (exit 退出)：")
    if command == "exit":
        break
    print(f"收到指令：{command}")
```

## 常见错误
- 忘记更新循环变量导致死循环。
- 在 `for` 循环中修改列表自身，引发意外行为。

## 进阶拓展
- 使用 `enumerate` 获取元素索引。
- 使用 `break`、`continue` 控制循环流程。
