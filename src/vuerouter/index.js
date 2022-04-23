let _Vue = null

export default class VueRouter{
    static install(Vue){
        //1. 判断当前插件是否已经安装
            if(VueRouter.install.installed){
                return
            }

            VueRouter.install.installed = true
        // 2. 把vue构造函数记录到全局变量(实例方法中使用)
            _Vue = Vue
        //3. 把创建Vue实例时候传入的router对象注入到Vue实例上(所有实例共享)
        // 混入
        _Vue.mixin({
            // 组件不执行，vue实例执行
            beforeCreate(){
                if(this.$options.router){
                    _Vue.prototype.$router = this.$options.router
                    this.$options.router.init()
                }
            }
        })

    }

    constructor(options){
        this.options = options
        this.routeMap = {} //存放 解析路由规则
        this.data =  _Vue.observable({
            current: '/'
        })  // 创建响应式对象 
    }
    createRouteMap(){
        // 遍历所有的路由规则，把路由规则解析城键值对的形式，存储到routeMap中
        this.options.routes.forEach(route=>{
            this.routeMap[route.path] = route.component
        })
    }

    init(){
        this.createRouteMap()
        this.initComponents(_Vue)
        this.initEvent()
    }

    initComponents(Vue){
        Vue.component('router-link',{
            props:{
                to: String,
            },
            render(h){
                return h('a', {
                    attrs:{
                        href: this.to
                    },
                    on:{
                        click: this.clickHandler
                    },
                }, [this.$slots.default])
            },
            methods:{
                clickHandler(e){
                    //popstate 传给事件对象的对象。 标题、跳转地址
                    history.pushState({},'', this.to)
                    this.$router.data.current = this.to
                    e.preventDefault()
                }
            }
            // template: '<a :href="to"><slot></slot></a>'
        })

        const self = this
        Vue.component('router-view',{
            render(h){
                const component = self.routeMap[self.data.current]
                return h(component)  //转成虚拟DOM
            }
        })
    }

    initEvent(){
        window.addEventListener('popstate', ()=>{
            //this vuerouter对象
            this.data.current = window.location.pathname
        })
    }
}