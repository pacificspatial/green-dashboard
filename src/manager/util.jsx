import _ from "ansuko"
import {AsYouType, parsePhoneNumber} from "libphonenumber-js"


export const waitAnimated = (func, frameCount = 0) => {
    requestAnimationFrame(() => {
        if (frameCount > 0) { return waitAnimated(func, frameCount - 1) }
        func()
    })
}

const toHalfWidth = value => String(value).split('').map(char => {
    const code = char.charCodeAt(0);
    // 全角は0xFF01～0xFF5E、半角は0x0021～0x007E
    if (code >= 0xFF01 && code <= 0xFF5E) {
        return String.fromCharCode(code - 0xFEE0);
    }
    return char;
}).join('');

export const waitAnimatedAsync = (frameCount = 0) => {
    return new Promise(resolve => {
        waitAnimated(resolve, frameCount)
    })
}

export const isEmpty = value => {
    if (_.isNil(value)) { return true }
    if (_.isNumber(value)) { return false }
    return _.isEmpty(value)
}

export const toNumber = value => {
    if (_.isNil(value)) { return null }
    let v = toHalfWidth(value)
    if (_.isNumber(v)) { return value }
    if (typeof v === "string" && v.includes(",")) {
        v =  _.toNumber(v.replace(/,/g, ""))
    }
    v =  _.toNumber(v)
    return _.isNaN(v) ? null : v
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
            .replace(" ", "-")
            .replace(" ", "-")
    ) : null

/**
 * 電話番号を+81xxxx表記にへんかｎ
 * @param phoneNumber {string}
 * @returns {string}
 */
export const phoneNumberToITN = (phoneNumber) => phoneNumber ?
    parsePhoneNumber(phoneNumber, "JP").number : null

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
