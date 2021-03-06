(function () {
    let initializing = false,
        // 检测函数中是否含有_super
        fnTest = /xyz/.test(function () {xyz;}) ?
            /\b_super\b/ : /.*/
    
    this.Class = function () {}

    Class.extend = function (prop) {
        // 保存父类原型    
        let _super = this.prototype

        initializing = true
        let prototype = new this() // 将父类实例作为子类原型
        initializing = false

        for (let name in prop) {
            prototype[name] = typeof prop[name] === 'function' &&
                typeof _super[name] === 'function' &&
                fnTest.test(prop[name]) ?
                (function (name, fn) {
                    return function () {
                        let tmp = this._super
                        this._super = _super[name]
                        let ret = fn.apply(this, arguments)
                        this._super = tmp
                        return ret
                    }
                })(name, prop[name]) :
                prop[name]
        }

        function Class () {
            if (!initializing && this.init) {
                this.init.apply(this, arguments)
            }
        }

        Class.prototype = prototype
        Class.prototype.constructor = Class
        Class.extend = arguments.callee

        return Class
    }
})()

let Animal = Class.extend({
    init: function (name) {
        this.name = name
    },
    shout: function (s) {
        console.log(s)
    }
})

let animal = new Animal('animal')
animal.shout('123')

let Dog = Animal.extend({
    init: function (name, age) {
        this._super.apply(this, arguments)
        this.age = age
    },
    run: function (s) {
        console.log(s)
    }
})

let dog = new Dog('dog', 4)
console.log(dog.name)
dog.shout('xxx')
dog.run('run')