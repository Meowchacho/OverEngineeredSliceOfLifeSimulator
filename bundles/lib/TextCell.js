class TextCell {
    rawLength = require('./CommonFunctions').rawLength;
    trunc = require('./CommonFunctions').stringTrimmer;

    constructor(text, size, align, hard) {
        this.size = size || 80;
        this.align = align || this.ALIGNS.LEFT;
        this.hardWrap = hard || true;
        this._text = '';
        this.x = 0;
        this.y = 0;

        if (!text || text == null || text === 'undefined') {
            text = '';
        }
        let [localPre,localPost] = text.split(':');
        this.maxPost = localPost ? this.rawLength(localPost) : null;
        this.maxPre = localPre ? this.rawLength(localPre) : null;

        this.addText(text);
    }

    get text() {
        let newText = this._text;
        if (this.rawLength(newText) > this.size) {
            if (this.hardWrap) {
                newText = this.trunc(newText);
            }
            else {
                //TODO: Do something
            }
        }
        return this.align(newText);
    }

    addText(text) {
        let newText = this._text + text;
        this._text = newText;
    }

    leftAlign(string) {
        let maxWidth = this.size;
        let pad = ' ';
        return string + pad.repeat(maxWidth - this.rawLength(string));
    }
    rightAlign(string) {
        let maxWidth = this.size;
        let pad = ' ';
        return pad.repeat(maxWidth - this.rawLength(string)) + string;
    }
    centerAlign(string) {
        let maxWidth = this.size;
        let stringWidth = this.rawLength(string);
        let pre = Math.floor((maxWidth - stringWidth) / 2);
        let post = maxWidth - stringWidth - pre; 
        let pad = ' ';
        return pad.repeat(pre) + string + pad.repeat(post);
    }
    dotAlignLeft(string) {
        let maxWidth = this.size;
        let colMaxPreLength = this.maxPre || string.indexOf(':');
        let [preDot, postDot] = string.split(':');
        let pad = ' ';

        let width = this.rawLength(preDot);
        preDot = pad.repeat(colMaxPreLength - width) + preDot;
        string = preDot + ':' + postDot;
        width = this.rawLength(string);
        string = string + pad.repeat(maxWidth - width);

        return string;
    }

    dotAlignRight(string) {
        let maxWidth = this.size;
        let colMaxPostLength = this.maxPost || string.indexOf(':');
        let [preDot, postDot] = string.split(':');
        let pad = ' ';

        let width = this.rawLength(postDot);
        postDot = postDot + pad.repeat(colMaxPostLength - width);
        string = preDot + ':' + postDot;
        width = this.rawLength(string)
        string = pad.repeat(maxWidth - width) + string;
        return string;
    }
    dotAlignCenter(string) {
        let maxWidth = this.size;
        let colMaxPostLength = this.maxPost || string.indexOf(':');
        let colMaxPreLength = this.maxPre || string.indexOf(':');
        let [preDot, postDot] = string.split(':');
        let pad = ' ';

        let width = this.rawLength(postDot);
        postDot = postDot + pad.repeat(colMaxPostLength - width);
        width = this.rawLength(preDot);
        preDot = pad.repeat(colMaxPreLength - width) + preDot;
        string = preDot + ':' + postDot;

        wiggleRoom = maxWidth - this.rawLength(string);

        let firsthalf = Math.floor(wiggleRoom / 2);
        let secondhalf = wiggleRoom - firsthalf;

        string = pad.repeat(firsthalf) + string + pad.repeat(secondhalf);

        return string;
    }

    ALIGNS = {
        'LEFT': this.leftAlign,
        'RIGHT': this.rightAlign,
        'CENTER': this.centerAlign,
        'DOTLEFT': this.dotAlignLeft,
        'DOTRIGHT': this.dotAlignRight,
        'DOTCENTER': this.dotAlignCenter
    }
}


module.exports = { TextCell };