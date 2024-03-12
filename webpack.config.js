//引入一个包
const path = require('path')

function resolve(dir) {
    return path.join(__dirname, dir)
}
//webpack中所有的配置信息都应该写在module.exports中
module.exports = {
    context: path.resolve(__dirname, './'),
    //mode: 'none',
    entry: './src/index.ts', // 指定入口文件
    output: {
        path: path.resolve(__dirname, 'lib'), // 指定打包文件的目录
        filename: 'index.js', // 打包后文件的名称
        globalObject: "typeof globalThis !== 'undefined' ? globalThis : typeof this !== 'undefined' ? this : typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : global ",
        //library: 'libName', // libName 为对外暴露的库名称
        libraryTarget: 'umd', // 定义模块运行的方式，将它的值设为umd
        //libraryExport: 'default',
    },
    // 指定webpack打包时要使用的模块
    module: {
        // 指定loader加载的规则
        rules: [
            {
                test: /\.ts$/, // 指定规则生效的文件：以ts结尾的文件
                use: [
                {
                    loader: "babel-loader",
                    options:{
                        presets: [
                            [
                                "@babel/preset-env",
                                {
                                    "targets":{
                                        "chrome": "57",
                                        "ie": "11"
                                    },
                                    "corejs":"3",
                                    "useBuiltIns": "usage"
                                }
                            ]
                        ]
                    }
                },
                {
                    loader: "ts-loader",

                }], // 要使用的loader
                exclude: /node-modules/ // 要排除的文件
            }
        ]
    },
    // 设置哪些文件类型可以作为模块被引用
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            '@': resolve('src')
        }
    }
}