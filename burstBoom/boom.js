/**
 * 初始化方法，
 *  1）提供 var bom = new boom() 构造函数，构建 boom 实例，调用 bom.boom()，传入 img 的 jQuery 对象，例如bom.boom($('img'))
 *  2）直接 boom() 进行调用，传入 img 的 jQuery 对象，例如 boom($('img'))
 */

(function(window, undefined) { //自执行构造函数
    var isInsetJq = false, //是否插入jQuery
        cssOption = { //CSS参数
            position: 'absolute',
            width: 0,
            heifht: 0,
            left: 0,
            top: 0
        },
        imgURl = '', //图片地址
        boom = function(elems,options) { //最终暴露方法_添加方法
            return new boom.prototype.init(elems,options);
        },
        imgArr = [], //图片数组
        imgNmb = 0, //传入图片数量
        // 动画效果预设参数
        argOptions = {
            // 缩放值
            'scaleLevel': 5,
            // 模糊值
            'blurLevel': 1,
            // 弹射距离
            'boomLevel': 4,
            // 爆炸时长
            'boomTime': 800,
            // 是否打开日志，所有日志写在 log 方法里
            'isOpenLog': false
        },
        //偏移距离
        arrRandomOffset = [1, -4, 8, -8, 9, -10, 12, -14, 18];

    //加载JS_条件过滤_创建
    function loadScript(url, callback) {
        if (isInsetJq) {
            return;
        }
        var ref = window.document.getElementsByTagName('script')[0],
            script = window.document.createElement('script');

        script.src = url;
        script.type = 'text/javascript';
        script.async = false;
        ref.parentNode.insertBefore(script, ref);

        if (callback && typeof(callback) === 'function') {
            script.onload = callback;
        }
        isInsetJq = true;
    }

    // 日志控制_关闭状态
    function log() {
        if (argOptions.isOpenLog) {
            console.log.apply(console, arguments);
        }
    }
    // // 偏移距离设置
    function arrRandomOff(level) {
      var i = 0;

      // reset array
      arrRandomOffset = [];

      for (var i=0; i < 9; i++) {
        arrRandomOffset[i] = level * i;
      }
    }

    // 计算坐标并添加爆炸层覆盖
    // 返回一个jQuery 对象（dom节点,一个完全覆盖图片的div）
    // elem 原图的 jQuery 对象
    function copyState(elem) {
        //得到原图的图片路径
        imgURl = elem.attr('src') || "";
        //转化为JS对象
        var obj = elem[0];

        //getBoundingClientRect()方法返回元素的大小及其相对于视口的位置
        var item = obj.getBoundingClientRect(),
            //获取原图的宽、高、定位
            elemCss = {
                width: obj.width,
                height: obj.height,
                top: item.top,
                left: item.left
            },
            //赋值样式给新div
            realCss = $.extend(cssOption, elemCss);

        var newDiv = $(document.createElement('div'));

        newDiv.css(realCss);

        $('section').append(newDiv);

        return newDiv;
    }

    //生成小的div，使用上面新创建的div的背景图
    function createMuchDiv(elem) {
        var obj = elem,
            width = elem.width(),
            height = elem.height(),
            miniNum = 10, //每行分的份数
            widthNum = 0, //一行的个数
            heightNum = 0, //一竖排的个数
            // div 小块的宽度
            newElemWidth = 0,
            i = 0,
            j = 0,
            elemArr = [];

        //长和宽的范围
        if (width <= 10 && height <= 10) {
            return;
        }
        //判断长和宽的最短
        var baseNum = width > height
            ? height
            : width;

        //根据宽、高 算出新div边长 和 每行 每排 数量
        if (baseNum == width) {
            newElemWidth = Math.floor(width / miniNum);
            heightNum = Math.floor(height / newElemWidth);
            widthNum = miniNum;
        } else {
            newElemWidth = Math.floor(height / miniNum);
            heightNum = Math.floor(width / newElemWidth);
            widthNum = miniNum;
        }

        //比较宽高大小 ，确定插入的数量
        if (height > width) {
            //当height大于width时，宽和高需要对调一下
            //因为上面拿到的是有多少横行和竖排，而下面我们需要的是每一行和每一排里面的具体个数
            widthNum = widthNum * heightNum;
            heightNum = widthNum / heightNum;
            widthNum = widthNum / heightNum;
        }

        //插入每一个小div ，并且定位
        for (; i < widthNum; i++) {
            for (; j < heightNum; j++) {
                var randomSize = Math.random() * argOptions.scaleLevel,
                    randomBlur = Math.random() * argOptions.blurLevel,
                    newElem = document.createElement('div'),
                    cssTop = i * newElemWidth,
                    cssLeft = j * newElemWidth,
                    posiElemCss = {
                        'background-image': 'url(' + imgURl + ')',
                        'background-repeat': 'no-repeat',
                        'background-position': '-' + cssLeft + 'px ' + '-' + cssTop + 'px',
                        'position': 'absolute',
                        'width': newElemWidth,
                        'height': newElemWidth,
                        'border-radius': '100%',
                        'top': cssTop,
                        'left': cssLeft,
                        //小块随机缩放
                        'transform': 'scale(' + randomSize + ')',
                        //filter效果_兼容前缀
                        '-webkit-filter': 'blur(' + randomBlur + 'px)',
                        '-moz-filter': 'blur(' + randomBlur + 'px)',
                        '-ms-filter': 'blur(' + randomBlur + 'px)',
                        'filter': 'blur(' + randomBlur + 'px)'
                    };
                $(newElem).css(posiElemCss);
                elemArr.push(newElem);
            }
            j = 0;
        }
        elem.append(elemArr);
    }

    //计算动画轨迹
    //center 图片中心坐标
    // div 将要运动的图片坐标
    // {x,y} 返回点div的动画轨迹终止点
    function ramdomPosition(center, div) {
        var
            //直线斜率
            slope = 0,
            //爆炸范围_超出图片最长边之后的距离
            randomBoomDis = Math.random() * 5,
            //距离_取到最长边画圆，以内都是它的距离
            distance = randomBoomDis * (center.x > center.y
                ? center.x
                : center.y),
            //结果
            result = {
                x: 0,
                y: 0
            };
            //判断div在中心点的上方还是下方
            // isTop = center.y - div.y > 0 ? 1 : 0;

            //如果新生成的div不是在X、Y轴之上
            if (center.x!=div.x && center.y!=div.y) {
              slope=(center.y-div.y) / (center.x-div.x);

              //直线公式: y=kx+b
              //通过b 可以判断出div在中心的上下
              var b=center.y-(slope*center.x),
              randomPosX=Math.random(),
              randomPosY=Math.random();

              //轨迹中止的Y点
              result.y = ((2 * div.y - center.y)) + ((randomPosX > 0.5 ? randomPosX * 4 : -randomPosX * 4)),
              //轨迹终止的X点
              result.x = ((result.y - b) / slope) + ((randomPosY > 0.5 ? randomPosY * 4 : -randomPosY * 4));
              return result;
            }else if (center.x == div.x) {
        			if (center.y > div.y) {
        				return {
        					x: center.x,
        					y: center.y - distance
        				}
        			} else {
        				return {
        					x: center.x,
        					y: center.y + distance
        				}
        			}
        		} else if (center.y == div.y) {
        			if (center.x > div.x) {
        				return {
        					x: center.x - distance,
        					y: center.y
        				}
        			} else {
        				return {
        					x: center.x + distance,
        					y: center.y
        				}
        			}
        		} else {
        			return;
        		}
    }

    //boom 对象
    boom.prototype={
      init:function (elems,options) {
        //参数的长度
        var argLength=arguments.length;
        //如果有参数，就传给boom这个方法
        if (arguments[0]!=undefined) {
          this.boom(elems);
        }
        //如果传参的时候有添加的修改属性，会推入到原型中
        argOptions=$.extend(argOptions,options);

        //修改弹射距离
        if (argOptions.boomLevel!=4) {
          arrRandomOff(argOptions.boomLevel);
        }
        return this;
      },
      //主方法 传入img
      boom:function (elems) {
        var elemLength=elems.length;

        //每点击一次 隐藏一张原图
        if (!elemLength) {
          return;
        }else {
          elem=elems.eq(imgNmb++).css({
            'opacity':'1'
          });
        }
        //如果最后一张隐藏，则从第一张开始
        if (imgNmb==elemLength) {
          imgNmb=0;
        }
        //0~2随机数
        var randomNum=Math.random()*2,
          //定一个图片中心，每次都不相同
          centerPonit={
            x:Math.floor(elem.width()/2)+randomNum,
            y:Math.floor(elem.height()/2)+randomNum
          };
          //生成新图，覆盖原图
          var newWrap=copyState(elem);


          //delay() 方法对队列中的下一项的执行设置延迟
          //queue()函数用于获取或设置当前匹配元素上待执行的函数队列。

          //推迟200毫秒 执行bomm队列
          elem.delay(200, 'boom')
          //为boom队列添加方法——函数
              .queue('boom',function (next) {
                //300s 后 隐藏原图
                $(this).animate({opacity: 0}, {duration:1})
                       .removeClass('shake');
              //调用该函数可以移除并执行当前队列中的第一个函数
              next();
            })
            .dequeue('boom')
            .addClass('shake')
            .queue('boom',function () {
              createMuchDiv(newWrap);
              var divs=newWrap.find('div'),
                length=divs.length,
                     i=0;

              for (; i <length; i++) {
                var div=divs.eq(i),
                    divPoint={
                      x:parseInt(div.css('left')),
                      y:parseInt(div.css('top'))
                    }

                    //一些随机数添加
                    var resultPoint=ramdomPosition(centerPonit,divPoint);

                    var randomOffset=arrRandomOffset[i % 9];
                    divs.eq(i).animate({
        							left: resultPoint.x + (Math.random() > 0.5 ? randomOffset : -randomOffset),
        							top: resultPoint.y + (Math.random() > 0.5 ? randomOffset : -randomOffset),
        							opacity: 0
        						}, argOptions.boomTime);
                  }
            });
      }
    }


    boom.prototype.init.prototype=boom.prototype;

    //暴露变量
    window.boom=boom;





})(window)
