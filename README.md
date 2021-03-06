# 手势密码
## 思路
- 利用HTML5的canvas api，绘制面板的9个圆和解锁路径折线，每个圆进行编号1~9。
- 监听手机触摸事件touchstart，touchmove和touchend，用数组touchcircle保存已经触摸的圆，数组restcircle保存剩下的圆。touchmove事件时不停的触发绘制解锁圆和路径的逻辑，用距离判断触摸点是否到达圆里
- 密码以圆的编号和坐标以数组的方式保存，即[{index：1,x:2,y:3},...]这样的方式
- 用变量state为0表示设置锁，touchend后对密码的长度和两次输入进行判断，一致则保存到localstorage
- state为1表示解锁，判断输入的密码与localstorage的是否一致

## 演示
### 主面板
![](/media/img/w1.jpg)
### 密码太短
![](/media/img/w2.jpg)
### 输入密码
![](/media/img/w3.jpg)
### 不一致
![](/media/img/w4.jpg)
### 设置成功
![](/media/img/w5.jpg)
### 密码错误
![](/media/img/w6.jpg)
### 密码正确
![](/media/img/w7.jpg)