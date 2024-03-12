test('test',() => {
    expect("1").toBe("1");
})

test('setTimeout',(done) => {
    console.log('aaa')
    setTimeout(() => {
        console.log('bbb')
        setTimeout(() => {
            console.log('ccc');
            done();
        }, 2000);
    }, 200);
})