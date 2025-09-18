---
title: 温度换算
slug: q5-temp-convert
chapter: intro
difficulty: 挑战
type: 编程题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
请编写程序，读取摄氏温度（整数或小数），输出对应的华氏温度，保留一位小数。转换公式：`F = C * 9 / 5 + 32`。
例如输入 `26.5`，输出 `Fahrenheit: 79.7`。

### 正确答案
```python
value = float(input())
fahrenheit = value * 9 / 5 + 32
print(f"Fahrenheit: {fahrenheit:.1f}")
```

### 解析
读取后需转换为浮点数，再使用格式化字符串控制小数位。

### 常见错误
- 使用整数除法导致结果不准确。
- 忘记格式化输出小数位，判题输出不一致。

### 进阶拓展
可扩展为函数，支持摄氏与开尔文的互转。
