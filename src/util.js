import readline from 'readline';
import Tesseract from 'tesseract.js';

export const prompt = (query) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => rl.question(query, ans => {
        resolve(ans);
        rl.close();
    }))
}

export const parseDate = (str) => {
    const strArr = str.split('-');
    let tempY = strArr[2];
    strArr[2] = strArr[0];
    strArr[0] = tempY;
    let newStr = strArr.join('-');

    return new Date(newStr);
}

export const solveCaptcha = async (captchaUrl) => {
    const ocr = await Tesseract.recognize(captchaUrl, 'eng');
    return ocr.data.text.replace('\\n', '');
}