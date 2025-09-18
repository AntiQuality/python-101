---
slug: q4-list-filter
chapter: loops
difficulty: 进阶
type: 单选题
memory_limit: 8MB
show_in_tutorial: true
show_in_bank: true
---
## 题目正文
从购物车列表中过滤出价格超过 100 元的商品，下列哪段代码更符合 Python 风格？
- A. `result = []\nfor price in cart:\n    if price > 100:\n        result.append(price)`
- B. `result = list(filter(lambda price: price > 100, cart))`
- C. `result = [cart[i] for i in range(len(cart)) if cart[i] > 100]`
- D. `result = {price for price in cart if price > 100}`

### 正确答案
A

### 解析
对初学者而言，使用简单的 `for` + `append` 结构最直观，便于理解流程；后续可再学习 `filter` 或列表推导式。

### 常见错误
- 使用集合推导式（选项 D）会改变数据结构。
- 使用下标循环（选项 C）不够 Pythonic，且易出错。

### 进阶拓展
熟悉循环后，可以改写为列表推导式 `result = [price for price in cart if price > 100]`，更紧凑。
