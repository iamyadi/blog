var P = (function (prototype, ownProperty, undefined) {
    function isObject (o) {
        return typeof o === 'object'
    }

    function isFunction (f) {
        return typeof f === 'function'
    }

    function BareConstructor () {}

    function P (_superclass, definition) {
        // 如果只有一个参数，没有指定父类默认为Object
        if (definition === undefined) {
            definition = _superclass
            _superclass = Object
        }

        // 要返回的子类，definition中的init为构造器
        function C () {
            let self = new Bare
            if (isFunction(self.init)) {
                self.init.apply(self, arguments)
            }
            // 指定返回的值 不论是使用new还是直接调用 返回值都是实例
            return self
        }

        // 为了让C不用new就能返回实例
        function Bare () {}

        C.Bare = Bare

        // 为了防止改动子类影响到父类，将父类的原型赋值给中介者BareConstructor
        // 再将中介者的的实例作为子类的原型
        let _super = BareConstructor[prototype] = _superclass[prototype],
            // C与Bare都共享同一个原型
            proto = Bare[prototype] = C[prototype] = new BareConstructor
        
        proto.constructor = C
        // mixin方法，将def对象里面的属性与方法放入原型中
        C.mixin = function (def) {
            Bare[prototype] = C[prototype] = P(C, def)[prototype]
            return C
        }


        // 执行一次open方法 此时definition才起作用
        return (C.open = function (def) {
            let extensions = {}

            if (isFunction(def)) {
                extensions = def.call(C, proto, _super, C, _superclass)
            } else if (isObject(def)) {
                extensions = def
            }
            if (isObject(extensions)) {
                for (let ext in extensions) {
                    if (ownProperty.call(extensions, ext)) {
                        proto[ext] = extensions[ext]
                    }
                }
            }
            if (!isFunction(proto.init)) {
                proto.init = _superclass
            }

            return C
        })(definition)
    }

    // 暴露到全局
    return P
})('prototype', ({}).hasOwnProperty)

let Animal = P(function (proto, superProto) {
    // 构造函数
    proto.init = function (name) {
        this.name = name
    } 
    // 方法
    proto.move = function (meters) {
        console.log(`${this.name} moved ${meters} M`)
    }
})

var a  = new Animal('aaa')
var b = Animal('bbb')

a.move(1)
b.move(2)

var Snake = P(Animal, function (snake, animal) {
    snake.init = function (name, eyes) {
           animal.init.apply(this, arguments)
           this.eyes = 2
    }
    snake.move = function () {
        console.log('Slithering...')
        animal.move.call(this, 5)
    }
})

var s = new Snake('snake', 1)
s.move()
console.log(s.name)
console.log(s.eyes)

var Cobra = P(Snake, function (cobra) {
    // 私有变量
    let age = 1
    function privateFunc () {
        console.log(age)   
    }
    cobra.glow = function () {
        privateFunc()
        return age++
    }
})

var c = new Cobra('cobra')
console.log(c.glow())
console.log(c.glow())
console.log(c.glow())


//
function createBase () {
    return P(FunctionBase, function (proto, superProto) {
                    proto.init = function () {
                        console.log('init Base')
                    }
                    proto.child = []
                })   
               
}

function createRect () {
    return P(Base, function (proto, superProto) {
        proto.init = function () {
            this.name = 'rect'
        }
    })
}
function createLine () {
    return P(Base, function (proto, superProto) {
            proto.init = function () {
                this.name = 'line'
            }
        })
}

let Base = createBase() 
let Rect = createRect()
let Line = createLine()

function Reset () {
    FunctionBase.prototype.compList.push({Base, Rect, Line})
    Base = createBase() 
    Rect = createRect()
    Line = createLine()
}

function Recovery (index) {
    let Obj = FunctionBase.prototype.compList.splice(index, 1)[0]
    Base = Obj.Base
    Rect = Obj.Rect
    Line = Obj.Line
}