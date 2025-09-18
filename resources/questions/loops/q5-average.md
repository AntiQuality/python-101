---
title: 平均分计算
slug: q5-average
chapter: loops
difficulty: 挑战
type: 编程题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
用户会多次输入成绩，输入 `done` 结束。请计算平均分并输出 `Average: X.Y`，保留一位小数；若没有合法成绩则输出 `No data`。

### 正确答案
```python
total = 0
count = 0

while True:
    value = input().strip()
    if value.lower() == "done":
        break
    if not value:
        continue
    score = float(value)
    total += score
    count += 1

if count == 0:
    print("No data")
else:
    print(f"Average: {total / count:.1f}")
```

### 解析
循环读取输入并累积数据，遇到 `done` 退出，最后根据数量决定输出。

### 常见错误
- 未处理空输入或 `done` 的大小写。
- 直接除以 `count` 未判断是否为 0，导致 `ZeroDivisionError`。

### 进阶拓展
可加入异常处理捕获非法数值，或记录最高/最低分。
