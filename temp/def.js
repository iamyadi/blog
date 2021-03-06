(function (global) {
    // 三种角色
    // 1. def('Animal')返回deferred,此时可以直接接括号对原型进行扩展
    // 2. 在继承父类时 < 触发两者调用valueOf, 此时执行deferred.valueOf里面的逻辑
    // 3. 在继承父类时，父类后面可以接括号，当做传送器，保存着父类与扩展包到_super, props
    let deferred

    // 扩展类的原型
    function extend(source) {
        let prop, 
            target = this.prototype

        for (let key in source) {
            if (source.hasOwnProperty(key)) {
                prop = target[key] = source[key]

                if ('function' === typeof prop) {
                    // 在每个原型方法上添加了两个自定义属性，保存类与方法名
                    prop._name = key
                    prop._class = this
                }
            }
        }
        return this
    }

    // 中介者 用于切断父类与子类的原型连接
    function SubClass () {}

    function base () {
        // 取得调用this._suepr()的函数
        let caller = base.caller
        // 执行父类的同名方法，参数要么用户传 要么取得当前函数的参数
        return caller._class
                    ._super.prototype[caller._name]
                    .apply(this, arguments.length ? arguments : caller.arguments)
    }

    function def (context, klassName) {
        klassName || (klassName = context, context = global)
        // 在context中创建一个类
        let Klass = context[klassName] = function Klass () {
            if (context !== this) {// 使用new调用，执行init方法
                return this.init && this.init.apply(this, arguments)
            }
            // 继承父类时父类接括号 保存父类与扩展
            deferred._super = Klass
            deferred._props = arguments[0] || {}
        }

        // 所有类都有一个extend方法
        Klass.extend = extend

        // 实现继承第一步 重写deferred
        deferred = function (props) {
            return Klass.extend(props)
        }

        // 继承第二步 重写valueOf方法(valueOf是添加在def上的，不是在class上的)
        deferred.valueOf = function () {
            let Superclass = deferred._super

            if (!Superclass) {
                return Klass
            }
            // 通过中介者，断开原型连接
            SubClass.prototype = Superclass.prototype
            let proto = Klass.prototype = new SubClass
            
            Klass._class = Klass
            Klass._super = Superclass

            Klass.toString = function () {
                return klassName
            }
            proto.constructor = Klass
            // 所有类公用base
            proto._super = base
            deferred(deferred._props)
        }

        return deferred
    }

    global.def = def
}(this))

def('Animal')({
    init: function (name) {
        this.name = name
    },
    speak: function (text) {
        console.log(`this is a ${this.name}`)
    }
})

let animal = new Animal('animal')
console.log(animal.name)
animal.speak()

def('Dog') < Animal({
    init: function (name, age) {
        this._super()
        this.age = age
    },
    run: function (s) {
        console.log(s)
    }
})
let dog = new Dog('xiao6', 6)
console.log(dog.name + dog.age)
dog.run('fast')

let namespace = {}
def(namespace, 'Shepherd') < Dog({
    init: function () {
        this._super()
    }
})

var shepherd = new namespace.Shepherd('shepherd', 8)
console.log(shepherd.name)
shepherd.run('123')