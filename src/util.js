export const parseDate = (str) => {
    const strArr = str.split('-');
    let tempY = strArr[2];
    strArr[2] = strArr[0];
    strArr[0] = tempY;
    let newStr = strArr.join('-');

    return new Date(newStr);
}