---
slug: q2-simple-input
chapter: intro
difficulty: 基础
type: 编程题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
请编写一个程序，读取用户输入的名字，并输出 `Hello, <name>!`。例如输入 `Xiao Mei`，输出 `Hello, Xiao Mei!`。

### 正确答案
```python
name = input()
print(f"Hello, {name}!")
```

### 解析
`input()` 默认读取一行字符串，可直接放入 f-string 中形成输出。

### 常见错误
- 使用 `print("Hello, name!")`，未将变量格式化进字符串。
- 忘记去掉多余的空格或换行，导致判题输出不一致。

### 进阶拓展
可以进一步提示用户输入，例如 `input("请输入名字：")`，并学习 `strip()` 来清理首尾空格。
