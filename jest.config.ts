export default {
    //automock: false,
    verbose: true,
    clearMocks: true, // 是否每次运行清除mock
    collectCoverageFrom: ['src/*.{js,ts}', 'src/**/*.{js,ts}'], //覆盖率文件
    coverageDirectory: 'coverage', // 生成覆盖率的文件名
    coverageProvider: 'v8',
    coverageThreshold: { // 覆盖率阈值
        global: {
            branches: 90,
            functions: 95,
            lines: 95,
            statements: 95,
        },
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'jsx', 'node'], // 文件扩展
    preset: 'ts-jest', //ts
    setupFilesAfterEnv: [ // 每次test的启动文件，类似main.ts
        "<rootDir>/test/boot.ts"
    ],
    testEnvironment: 'node', // node、jsdom
    testRegex: '(/test/.+\\.(test|spec))\\.(ts|tsx|js)$', // 要进行test的文件正则
};