const { TextCell } = require("./TextCell");

class Tablette {

    constructor() {
        this.table = new Map();
        this.rows = new Map();
    }

    readTable(table, size) {
        table.forEach((row, index) => {
            let x = index + 1;

            row.forEach((cell, indexx) => {
                let y = indexx + 1;

                this.addCell(x, y, new TextCell(cell, size));
            });
        })
    }
    addCell(x, y, cell) {
        cell.x = x;
        cell.y = y;

        let row = this.rows.get(x);
        if (!row) {
            row = new Array();
        }
        row.push(cell);
        this.rows.set(x, row);
        this.table.set(x + ':' + y, cell);
    }

    removeCell(x, y) {
        this.table.delete(x + ':' + y);
    }

    getCell(x, y) {
        return this.table.get(x + ':' + y);
    }

    getRange(rangeString) {
        let [start, end] = rangeString.split('-');
        let [startX, startY] = start.split(':');
        let [endX, endY] = end.split(':');

        let rangeArray = [];
        while (parseInt(startX) <= parseInt(endX)) {
            let yCounter = startY
            while (parseInt(yCounter) <= parseInt(endY)) {
                rangeArray.push(startX + ':' + yCounter);
                yCounter++;
            }
            startX++;
        }
        return this.getCells(rangeArray);
    }

    setRange(arrayOfCells) {
        arrayOfCells.forEach((element) => {
            this.table.set(element.x + ':' + element.y, element);
        });

    }

    formatRange(rangeString, config) {
        cells = this.getRange(rangeString);
    }

    getCells(cellArray) {
        let output = []
        cellArray.forEach(element => {
            let cell = this.table.get(element)
            if (cell) {
                output.push(cell);
            }
        });

        return output;
    }

    getAndSetMaxes(cells) {

        let maxima = cells.reduce((acc = { 'maxPre': 0, 'maxPost': 0 }, val) => {
            acc.maxPre = (acc.maxPre === undefined || val.maxPre > acc.maxPre) ? val.maxPre : acc.maxPre;
            acc.maxPost = (acc.maxPost === undefined || val.maxPost > acc.maxPost) ? val.maxPost : acc.maxPost;
            return acc;
        }, [])

        cells.forEach((cell) => {
            cell.maxPost = maxima.maxPost;
            cell.maxPre = maxima.maxPre;
        })
    }

    getPrintableArray() {
        let arrayOfStrings = new Array();
        this.rows.forEach((element) => {

            let stringValue = element.reduce((acc, cv, index) => {
                acc = acc + cv.text;
                return acc;
            }, '')

            arrayOfStrings.push(stringValue);
        })

        return arrayOfStrings;
    }
}

module.exports = Tablette;