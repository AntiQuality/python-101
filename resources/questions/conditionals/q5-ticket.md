---
title: 影院票价
slug: q5-ticket
chapter: conditionals
difficulty: 挑战
type: 编程题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
影院根据年龄提供票价优惠：
- 12 岁及以下儿童票价 25 元
- 60 岁及以上老年票价 30 元
- 其余客人票价 45 元
请编写程序，读取年龄和是否持学生证（`yes` / `no`），持学生证可额外减 5 元，输出 `Price: X`。

### 正确答案
```python
age = int(input())
has_card = input().strip().lower()

if age <= 12:
    price = 25
elif age >= 60:
    price = 30
else:
    price = 45

if has_card == "yes":
    price -= 5

print(f"Price: {price}")
```

### 解析
票价规则可分两步：先根据年龄确定基础票价，再判断是否持学生证减免 5 元。

### 常见错误
- 将学生证判定写在 `elif` 中，导致只有某些年龄段能享受优惠。
- 忘记统一输入大小写，比较时判定失败。

### 进阶拓展
实际业务可根据会员等级、节假日等叠加优惠，适合使用函数封装或配置表驱动。
