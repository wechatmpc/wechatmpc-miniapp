const mapSeed="tbren2js1pwxjz04uomqm848nxnxcyps"

function strToHex(str) {
  let hexString = '';
  
  for (let i = 0; i < str.length; i++) {
    // 获取Unicode码点
    let codePoint = str.codePointAt(i);
    
    // 如果是代理对，跳过低代理项
    if (codePoint > 0xFFFF) {
      i++;
    }
    
    // UTF-8编码
    if (codePoint < 0x80) {
      // 1字节 (0xxxxxxx)
      hexString += codePoint.toString(16).padStart(2, '0');
    } else if (codePoint < 0x800) {
      // 2字节 (110xxxxx 10xxxxxx)
      hexString += ((0xC0 | (codePoint >> 6))).toString(16).padStart(2, '0');
      hexString += ((0x80 | (codePoint & 0x3F))).toString(16).padStart(2, '0');
    } else if (codePoint < 0x10000) {
      // 3字节 (1110xxxx 10xxxxxx 10xxxxxx)
      hexString += ((0xE0 | (codePoint >> 12))).toString(16).padStart(2, '0');
      hexString += ((0x80 | ((codePoint >> 6) & 0x3F))).toString(16).padStart(2, '0');
      hexString += ((0x80 | (codePoint & 0x3F))).toString(16).padStart(2, '0');
    } else {
      // 4字节 (11110xxx 10xxxxxx 10xxxxxx 10xxxxxx)
      hexString += ((0xF0 | (codePoint >> 18))).toString(16).padStart(2, '0');
      hexString += ((0x80 | ((codePoint >> 12) & 0x3F))).toString(16).padStart(2, '0');
      hexString += ((0x80 | ((codePoint >> 6) & 0x3F))).toString(16).padStart(2, '0');
      hexString += ((0x80 | (codePoint & 0x3F))).toString(16).padStart(2, '0');
    }
  }
  
  return hexString;
}

const resotreSeed= (uid,pin) =>
{
  const seed = uid+pin+mapSeed
  return strToHex(seed)
}

module.exports = { resotreSeed };
