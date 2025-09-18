---
title: 满减计算
slug: q2-discount
chapter: conditionals
difficulty: 基础
type: 单选题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
商场满减活动：满 200 元减 50 元。下列哪段代码可以正确计算顾客实付金额？
- A.
```python
total = int(input())
if total >= 200:
    total = total - 200
print(total)
```
- B.
```python
total = float(input())
if total > 200:
    total = total - 50
print(total)
```
- C.
```python
total = float(input())
if total >= 200:
    total -= 50
print(total)
```
- D.
```python
total = float(input())
if total == 200:
    total -= 50
print(total)
```

### 正确答案
C

### 解析
需要包含 200 元本身，并且减 50 元而非减 200。

### 常见错误
- 忘记包含恰好 200 元的情况。
- 误把满减金额写成 200。

### 进阶拓展
可结合 `elif` 处理多档活动，例如满 300 减 80。
