---
slug: q3-weather
chapter: conditionals
difficulty: 进阶
type: 编程题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
输入今天的空气质量指数（AQI），根据数值输出对应提示：
- AQI 小于 50，输出 `空气很好，适合户外运动`
- 50 到 100（含），输出 `空气一般，敏感人群注意`
- 大于 100，输出 `空气较差，建议减少外出`

### 正确答案
```python
aqi = int(input())
if aqi < 50:
    print("空气很好，适合户外运动")
elif aqi <= 100:
    print("空气一般，敏感人群注意")
else:
    print("空气较差，建议减少外出")
```

### 解析
条件需覆盖全部区间，第二段判断包括上边界 100。

### 常见错误
- 漏掉等于 50 或等于 100 的情况。
- 将判断顺序写反导致条件永远命中。

### 进阶拓展
可将文本提示抽离为字典，便于国际化与扩展。
