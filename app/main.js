window.pillstreak = (function() {
    var exports = {
        init: function() {
            this.cells = document.querySelectorAll(".cell");
            var row, col;
            for (var i=0; i<this.cells.length; i++) {
                row = i % 4;
                col = parseInt(i / 4);
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
                return free[ parseInt(free.length * Math.random()) ];
            }
        },
        setCell: function(cell, data) {
            var prop;
            for (prop in data) {
                cell.setAttribute(prop, data[prop]);
            }
        },
    };
    return exports;
})();

window.pillstreak.init();
