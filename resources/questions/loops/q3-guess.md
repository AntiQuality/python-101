---
title: 猜数字
slug: q3-guess
chapter: loops
difficulty: 进阶
type: 编程题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
写一个猜数字小游戏，预设答案为 `42`。用户不断输入数字，高于答案提示 `太大了`，低于答案提示 `太小了`，猜中后输出 `猜对啦` 并结束循环。

### 正确答案
```python
TARGET = 42
while True:
    guess = int(input())
    if guess > TARGET:
        print("太大了")
    elif guess < TARGET:
        print("太小了")
    else:
        print("猜对啦")
        break
```

### 解析
使用无限循环搭配 `break`，根据比较结果给出不同提示。

### 常见错误
- 忘记 `break` 导致循环无法结束。
- 将输入当成字符串比较，逻辑永远不成立。

### 进阶拓展
可随机生成答案、限制尝试次数、或加入异常处理防止非法输入。
