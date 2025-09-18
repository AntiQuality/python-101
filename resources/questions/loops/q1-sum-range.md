---
slug: q1-sum-range
chapter: loops
difficulty: 基础
type: 编程题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
输入一个正整数 `n`，计算 1 到 n 的和并输出 `Total: X`。例如输入 `5`，输出 `Total: 15`。

### 正确答案
```python
n = int(input())
total = 0
for i in range(1, n + 1):
    total += i
print(f"Total: {total}")
```

### 解析
使用 `for` 循环累加范围内的数字，或直接使用 `sum(range(1, n + 1))`。

### 常见错误
- `range` 终止值写成 `n` 导致缺少最后一个数字。
- 将 `total` 初始化为 1，导致结果偏大。

### 进阶拓展
可用等差数列公式 `n * (n + 1) / 2` 提升效率。
