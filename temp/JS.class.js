let JS = {
    VERSION: '2.2.1'
}
JS.Class = function (classDefinition) {
    
    // 返回构造器
    function getClassBase () {
        return function () {
            // 执行用户传入的构造器construct
            // preventJSBaseConstructorCall为了防止在createClassDefinition中执行父类的construct
            if (typeof this['construct'] === 'function' && preventJSBaseConstructorCall === false) {
                this.construct.apply(this, arguments)
            }
        }
    }

    // 为目标类添加类成员与原型成员
    function createClassDefinition (classDefinition) {
        // 保存父类的同名方法
        let parent = this.prototype['parent'] || (this.prototype['parent'] = {})
        for (let prop in classDefinition) {
            if (prop === 'statics') {
                // 添加类成员
                for (let sprop in classDefinition.statics) {
                    this[sprop] = classDefinition.statics[sprop]
                }
            } else {
                // 为目标类添加原型成员 如果为函数且有父类有同名方法，将方法放入parent中
                if (typeof this.prototype[prop] === 'function') {
                    let parentMethod = this.prototype[prop]
                    parent[prop] = parentMethod
                }
                this.prototype[prop] = classDefinition[prop]
            }
        }
    }

    let preventJSBaseConstructorCall = true
    let Base = getClassBase()
    preventJSBaseConstructorCall = false

    // 向Base中添加类成员与原型成员
    createClassDefinition.call(Base, classDefinition)

    // 用于创建当前类的子类
    Base.extend = function (classDefinition) {
        preventJSBaseConstructorCall = true
        let SonClass = getClassBase()
        SonClass.prototype = new this() // 将父类实例作为子类的原型
        preventJSBaseConstructorCall = false

        createClassDefinition.call(SonClass, classDefinition)
        SonClass.extend = this.extend

        return SonClass
    }
    return Base
}

let Animal = JS.Class({
    construct: function (name) {
        this.name = name
    },
    shout: function (s) {
        console.log(s)
    }
})

let animal = new Animal()
animal.shout('animal')

let Dog = Animal.extend({
    construct: function (name, age) {
        this.parent.construct.apply(this, arguments)
        this.age = age
    },
    run: function (s) {
        console.log(s)
    }
})

let dog = new Dog('dog', 4)
console.log(dog.name)
dog.shout('dog')
dog.run('run')

let Shepherd = Dog.extend({
    statics: {
        TYPE: "Shepherd"
    },
    run: function () {
        this.parent.run.call(this, 'fast')
    }
})

console.log(Shepherd.TYPE)
let shepherd = new Shepherd('shepherd', 5)
shepherd.run()