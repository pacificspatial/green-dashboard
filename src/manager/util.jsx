import _ from "ansuko";
import {AsYouType, parsePhoneNumber} from "libphonenumber-js";


export const waitAnimated = (func, frameCount = 0) => {
    requestAnimationFrame(() => {
        if (frameCount > 0) { return waitAnimated(func, frameCount - 1) }
        func()
    })
}

export const waitAnimatedAsync = (frameCount = 0) => {
    return new Promise(resolve => {
        waitAnimated(resolve, frameCount)
    })
}

export const boolIf = (value, defaultValue = false) => {
    if (_.isBoolean(value)) { return value }
    if (_.isNumber(value)) { return !!value }
    return defaultValue
}

const AsYouTypeJp = new AsYouType("JP")

/**
 * 電話番号を0x0-xxxx-xxxx形式に変換
 * @param phoneNumber {string}
 * @returns {string}
 */
export const phoneNumberToJP = (phoneNumber) => phoneNumber ?
    (new AsYouType("JP").input(phoneNumber)
        .replace("+81 ", "0")
        .replace(" ", "-")) : null

/**
 * 電話番号を+81xxxx表記にへんかｎ
 * @param phoneNumber {string}
 * @returns {string}
 */
export const phoneNumberToITN = (phoneNumber) => phoneNumber ?
    parsePhoneNumber(phoneNumber, "JP").number : null

// 全角英数ー＞半角英数
export const toHalfWidth = str => validStr(str) ? str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s =>
    String.fromCharCode(s.charCodeAt(0) - 0xFEE0)) : str

export const kanaToFull = str => {
    if (!validStr(str)) { return str }
    const kanaMap = {
        'ｶﾞ': 'ガ', 'ｷﾞ': 'ギ', 'ｸﾞ': 'グ', 'ｹﾞ': 'ゲ', 'ｺﾞ': 'ゴ',
        'ｻﾞ': 'ザ', 'ｼﾞ': 'ジ', 'ｽﾞ': 'ズ', 'ｾﾞ': 'ゼ', 'ｿﾞ': 'ゾ',
        'ﾀﾞ': 'ダ', 'ﾁﾞ': 'ヂ', 'ﾂﾞ': 'ヅ', 'ﾃﾞ': 'デ', 'ﾄﾞ': 'ド',
        'ﾊﾞ': 'バ', 'ﾋﾞ': 'ビ', 'ﾌﾞ': 'ブ', 'ﾍﾞ': 'ベ', 'ﾎﾞ': 'ボ',
        'ﾊﾟ': 'パ', 'ﾋﾟ': 'ピ', 'ﾌﾟ': 'プ', 'ﾍﾟ': 'ペ', 'ﾎﾟ': 'ポ',
        'ｳﾞ': 'ヴ', 'ﾜﾞ': 'ヷ', 'ｦﾞ': 'ヺ',
        'ｱ': 'ア', 'ｲ': 'イ', 'ｳ': 'ウ', 'ｴ': 'エ', 'ｵ': 'オ',
        'ｶ': 'カ', 'ｷ': 'キ', 'ｸ': 'ク', 'ｹ': 'ケ', 'ｺ': 'コ',
        'ｻ': 'サ', 'ｼ': 'シ', 'ｽ': 'ス', 'ｾ': 'セ', 'ｿ': 'ソ',
        'ﾀ': 'タ', 'ﾁ': 'チ', 'ﾂ': 'ツ', 'ﾃ': 'テ', 'ﾄ': 'ト',
        'ﾅ': 'ナ', 'ﾆ': 'ニ', 'ﾇ': 'ヌ', 'ﾈ': 'ネ', 'ﾉ': 'ノ',
        'ﾊ': 'ハ', 'ﾋ': 'ヒ', 'ﾌ': 'フ', 'ﾍ': 'ヘ', 'ﾎ': 'ホ',
        'ﾏ': 'マ', 'ﾐ': 'ミ', 'ﾑ': 'ム', 'ﾒ': 'メ', 'ﾓ': 'モ',
        'ﾔ': 'ヤ', 'ﾕ': 'ユ', 'ﾖ': 'ヨ',
        'ﾗ': 'ラ', 'ﾘ': 'リ', 'ﾙ': 'ル', 'ﾚ': 'レ', 'ﾛ': 'ロ',
        'ﾜ': 'ワ', 'ｦ': 'ヲ', 'ﾝ': 'ン',
        'ｧ': 'ァ', 'ｨ': 'ィ', 'ｩ': 'ゥ', 'ｪ': 'ェ', 'ｫ': 'ォ',
        'ｯ': 'ッ', 'ｬ': 'ャ', 'ｭ': 'ュ', 'ｮ': 'ョ',
        '｡': '。', '､': '、', 'ｰ': 'ー', '｢': '「', '｣': '」', '･': '・', '\\)': '）', '\\(': '（'
    }

    const regex = new RegExp(`(${Object.keys(kanaMap).join('|')})`, 'g')
    return str.replace(regex, m => kanaMap[m])
}

const validStr = str => {
    if(_.isNil(str)) { return false }
    if(_.isEmpty(str)) { return false }
    return typeof str === "string"
}

export const kanaToHira = str => validStr(str) ? kanaToFull(str)
    .replace(/[\u30a1-\u30f6]/g, s => String.fromCharCode(s.charCodeAt(0) - 0x60)) : str

export const hiraToKana = str => validStr(str) ? str
    .replace(/[\u3041-\u3096]/g, s => String.fromCharCode(s.charCodeAt(0) + 0x60)) : str

export const hash = async (text, type) => {
    const uint8 = new TextEncoder("utf8").encode(text)
    const arrayBuffer = await crypto.subtle.digest(type, uint8)
    return arrayBuffer.map(b => b.toString(16).padStart(2, '0')).join('')
}
