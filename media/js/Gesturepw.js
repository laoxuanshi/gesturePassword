function Gesturepw() {}

// 初始化解锁密码面板
Gesturepw.prototype.init = function () {
    window.localStorage.removeItem('password');
    this.fpw=null;   //暂时保存第一次密码
    this.state=0;     //表示当前状态：0表示设置密码，1验证密码
    this.touchable = false;      //按顺序保存触摸过的圆
    this.touchcircle = [];     //标志是否可触摸
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.initCircle();      //初始化面板
    this.listenEvent();     //事件绑定
};

// 创建解锁点的坐标，规定半径,根据圆心和半径绘制初始9个圆
Gesturepw.prototype.initCircle = function () {
    var idx = 0;
    this.r = this.ctx.canvas.width / 14;//规定9个圆的半径
    this.touchcircle = []; //存放触摸轨迹
    this.allcircle = [];       //存放所有9个圆
    this.restcircle = [];      //存放未触摸圆

    //3*3面板，圆的编号为1~9
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            idx++;
            var obj = {
                x: 4 * j * this.r + 3 * this.r,
                y: 4 * i * this.r + 3 * this.r,
                index: idx
            };
            this.allcircle.push(obj);
            this.restcircle.push(obj);
        }
    }

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    //根据坐标绘制圆
    for (var i = 0; i < this.allcircle.length; i++) {
        this.ctx.strokeStyle = 'black';
        this.ctx.fillStyle = 'white';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(this.allcircle[i].x,this.allcircle[i].y, this.r, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();
        this.ctx.fill();
    }
};

// 用橙色圆表示已触摸的点
Gesturepw.prototype.drawTouchCircle = function () {
    for (var i = 0; i < this.touchcircle.length; i++) {
        this.ctx.fillStyle = 'orange';
        this.ctx.beginPath();
        this.ctx.arc(this.touchcircle[i].x, this.touchcircle[i].y, this.r, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.fill();
    }
};

// 用红线表示触摸路线
Gesturepw.prototype.drawTouchRoute = function (point, touchcircle) {
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(this.touchcircle[0].x, this.touchcircle[0].y);
    for (var i = 1; i < this.touchcircle.length; i++) {
        this.ctx.lineTo(this.touchcircle[i].x, this.touchcircle[i].y);
    }
    this.ctx.lineTo(point.x, point.y);
    this.ctx.strokeStyle = 'red';
    this.ctx.stroke();
    this.ctx.closePath();
};

//求平面坐标上两点距离公式
Gesturepw.prototype.DistanceOfPoints = function(point1, point2) {
    var di=Math.sqrt(Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2));
    return di;
};

Gesturepw.prototype.chooseCircle = function (point1, point2) {
    var direction = point2.index > point1.index ? 1 : -1;    //方向
    var num = direction === 1 ? 0 : ( this.restcircle.length - 1);
    var end = direction === 1 ?  this.restcircle.length : -1;

    while (num !== end) {
        if (this.DistanceOfPoints(this.restcircle[num], point1) + this.DistanceOfPoints(this.restcircle[num], point2) === this.DistanceOfPoints(point1, point2)) {
            this.drawTouchCircle(this.restcircle[num].x, this.restcircle[num].y);
            this.touchcircle.push(this.restcircle[num]);
            this.restcircle.splice(num, 1);
            if (end > 0) {
                end--;
                num--;
            }
        }
        num += direction;
    }
};

// 获取touch点相对于canvas的坐标
Gesturepw.prototype.getCanvasP = function (e) {
    var rect = e.currentTarget.getBoundingClientRect();
    var point = {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
    };
    return point;
};

// 判断密码是否一致
Gesturepw.prototype.PasswordIsEqual = function (pw1, pw2) {
    if(pw1.length!=pw2.length)
        return false;
    for (var i = 0; i < pw1.length; i++) {
        if(pw1[i].index!= pw2[i].index){
            return false;
        }
    }
    return true;
};

//设置密码的各种可能性，用fpw保存第一次输入的密码
Gesturepw.prototype.setlock = function (pw){
    window.localStorage.removeItem('password');
    if(!this.fpw){
        if(pw.length < 5)
            document.getElementById('title').innerHTML = '密码太短，至少需要5个点';
        else{
            this.fpw= pw;
            document.getElementById('title').innerHTML = '请再次输入手势密码';
        }
    }else{
        if (this.PasswordIsEqual(this.fpw, pw)) {
            document.getElementById('title').innerHTML = '密码设置成功';
            window.localStorage.setItem('password', JSON.stringify(this.fpw));
            this.fpw=null;
        }else{
            document.getElementById('title').innerHTML = '两次的输入不一致，请重新输入';
            this.fpw=null;
        }
    }
};

//根据localStorage保存的密码解锁
Gesturepw.prototype.unlock = function (pw){
    document.getElementById('title').innerHTML = '请解锁';
    //输入的密码与localstorage存储的密码对比
    if (this.PasswordIsEqual(JSON.parse(window.localStorage.getItem('password')), pw)) {
        document.getElementById('title').innerHTML = '密码正确！';
        setTimeout(function () {
            document.getElementById('title').innerHTML = '请解锁！';
        }, 700);
    } else {
        document.getElementById('title').innerHTML = '密码错误';
        setTimeout(function () {
            document.getElementById('title').innerHTML = '请解锁！';
        }, 700);
    }
};

Gesturepw.prototype.listenEvent = function () {
    var cur = this;    //保存当前this指针
    
    document.getElementById('updatePassword').addEventListener('click', function () {
        location.reload();
    });

    document.getElementById('checkPassword').addEventListener('click', function () {
        if (window.localStorage.getItem('password') == null)
            location.reload();
        else {
            cur.state=1;
            document.getElementById('title').innerHTML = '请解锁';
        }
    });

    //开始触摸
    this.canvas.addEventListener("touchstart", function (e) {
        e.preventDefault();
        var po = cur.getCanvasP(e);
        for (var i = 0; i < cur.allcircle.length; i++) {
            if (Math.abs(po.x - cur.allcircle[i].x) < cur.r && Math.abs(po.y - cur.allcircle[i].y) < cur.r) {
                cur.touchable = true;
                cur.drawTouchCircle(cur.allcircle[i].x, cur.allcircle[i].y);
                cur.touchcircle.push(cur.allcircle[i]);
                cur.restcircle.splice(i, 1);
                break;
            }
        }
    }, false);

    //在触摸屏移动
    this.canvas.addEventListener("touchmove", function (e) {
        if (cur.touchable) {
            cur.ctx.clearRect(0, 0, cur.ctx.canvas.width, cur.ctx.canvas.height);
            // 每帧先把面板画出来
            for (var i = 0; i < cur.allcircle.length; i++) {
                cur.ctx.strokeStyle = 'black';
                cur.ctx.fillStyle = 'white';
                cur.ctx.lineWidth = 1;
                cur.ctx.beginPath();
                cur.ctx.arc(cur.allcircle[i].x, cur.allcircle[i].y, cur.r, 0, Math.PI * 2, true);
                cur.ctx.closePath();
                cur.ctx.stroke();
                cur.ctx.fill();
            }

            cur.drawTouchCircle(cur.touchcircle);// 画橙色圆
            cur.drawTouchRoute(cur.getCanvasP(e), cur.touchcircle);// 画路径

            for (var i = 0; i < cur.restcircle.length; i++) {
                if (Math.abs(cur.getCanvasP(e).x - cur.restcircle[i].x) < cur.r && Math.abs(cur.getCanvasP(e).y - cur.restcircle[i].y) < cur.r) {
                    cur.drawTouchCircle(cur.restcircle[i].x, cur.restcircle[i].y);
                    cur.chooseCircle(cur.touchcircle[cur.touchcircle.length - 1], cur.restcircle[i]);
                    break;
                }
            }
        }
    }, false);
    
    document.addEventListener('touchmove', function (e) {
        e.preventDefault();
    }, false);
    
    //结束触摸
    this.canvas.addEventListener("touchend", function (e) {
        if (cur.touchable) {
            cur.touchable = false;
            if(cur.state==0)
                cur.setlock(cur.touchcircle);
            else
                cur.unlock(cur.touchcircle);
            setTimeout(function () {
                cur.initCircle();
            }, 500);
        }
    }, false);

};

