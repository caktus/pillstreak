/* global pillstreak */
window.pillstreak = (function() {
    var exports = {
        init: function() {
            this.cells = document.querySelectorAll(".cell");
            var row, col;
            for (var i=0; i<this.cells.length; i++) {
                row = i % 4;
                col = parseInt(i / 4, 10);
                this.cells[i].setAttribute('type', 'free');
                this.cells[i].setAttribute('row', row);
                this.cells[i].setAttribute('col', col);
            }
        },
        getFreeCell: function() {
            var free = [];
            for (var i=0; i<this.cells.length; i++) {
                if (this.cells[i].getAttribute('type') === 'free') {
                    free.push(this.cells[i]);
                }
            }
            if (free.length > 0) {
                return free[ parseInt(free.length * Math.random(), 10) ];
            }
        },
        setCell: function(cell, data) {
            var prop;
            for (prop in data) {
                cell.setAttribute(prop, data[prop]);
            }
        },

        getNeighbor: function(cell, direction) {
            var row = parseInt(cell.getAttribute('row'), 10); 
            var col = parseInt(cell.getAttribute('col'), 10); 

            switch (direction) {
                case 'up':
                    row--;
                    break;
                case 'down':
                    row++;
                    break;
                case 'left':
                    col--;
                    break;
                case 'right':
                    col++;
                    break;
                default:
                    break;
            }

            if (row < 0 || row > 3 || col < 0 || col > 3) {
                return null;
            } else {
                return this.getCellAt(row, col);
            }
        },

        getCellAt: function(row, col) {
            return document.querySelector(".cell[col='"+col+"'][row='"+row+"']");
        },

        getRow: function(row) {
            var cells = document.querySelectorAll(".cell[row='"+row+"']");
            cells.forEach = Array.prototype.forEach;
            return cells;
        },

        swapCells: function(cell, other) {
            var first_row = cell.getAttribute('row');
            var first_col = cell.getAttribute('col');

            cell.setAttribute('row', other.getAttribute('row'));
            cell.setAttribute('col', other.getAttribute('col'));

            other.setAttribute('row', first_row);
            other.setAttribute('col', first_col);
        },

        shiftUp: function() {
            var neighbor;
            
            function shiftRowUp(cell) {
                if (cell.getAttribute('type') !== 'free') {
                    neighbor = pillstreak.getNeighbor(cell, 'up');
                    if (neighbor && neighbor.getAttribute('type') === 'free') {
                        pillstreak.swapCells(cell, neighbor);
                    }
                }
            }

            for (var i = 0; i < 4; i ++) {
                this.getRow(i).forEach(shiftRowUp);
            }
        },
    };
    return exports;
})();

window.pillstreak.init();
