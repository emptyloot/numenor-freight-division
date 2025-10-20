
function Calculator(a,b) {
    console.log('Calculator Called')
    const aSize = Number(a)
    const bSize = Number(b)
    console.log(a)
    if (aSize <= 0 || bSize <= 0) {
        return 0
    }
    const result = aSize * bSize
    return (result)
}

export default Calculator