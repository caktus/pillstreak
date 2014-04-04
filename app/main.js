/* global pillstreak */
window.pillstreak = (function() {
    var KEYS = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
    };

    var CONF = {
        ANIM_SPEED: 100,
        SHIFT_SPEED: 110,
        DEBUG_SHIFT: false,
    }

    var exports = {
        init: function() {
            this.$game = document.querySelector('#game');
            this.$$cells = document.querySelectorAll(".cell");
            this.$points = document.querySelector('#points');
            this.$health = document.querySelector('#health_points');
            this.lost = false;

            var i, row, col;
            for (i=0; i<this.$$cells.length; i++) {
                row = i % 4;
                col = parseInt(i / 4, 10);
                this.$$cells[i].setAttribute('type', 'free');
                this.$$cells[i].setAttribute('row', row);
                this.$$cells[i].setAttribute('col', col);
                this.$$cells[i].setAttribute('level', '');
            }

            pillstreak.populateRandom();

            this.$game.focus();
            document.body.onkeyup = function(ev) {
                pillstreak.shiftAllCells(KEYS[ev.keyCode])
            };

            Hammer(document.body, {
                swipe: true,
                swipe_velocity: 0.2,
            }).on('swipeup swipedown swipeleft swiperight', function(ev) {
                pillstreak.shiftAllCells(ev.gesture.direction);
            });
        },

        addPoints: function(points) {
            var cur = parseInt(this.$points.innerHTML, 10);
            this.$points.innerHTML = cur + points;
        },
        loseHealth: function() {
            var cur = parseInt(this.$health.innerHTML, 10);
            this.$health.innerHTML = cur - 1;
            if (cur - 1 === 0) {
                // lost the game!
                this.lost = true;
            }
        },

        getFreeCell: function() {
            var free = [];
            for (var i=0; i<this.$$cells.length; i++) {
                if (this.$$cells[i].getAttribute('type') === 'free') {
                    free.push(this.$$cells[i]);
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
        setCellAt: function(row, col, data) {
            this.setCell(this.getCellAt(row, col), data);
        },

        getCellAt: function(row, col) {
            return document.querySelector(".cell[col='"+col+"'][row='"+row+"']");
        },

        getRow: function(row) {
            var cells = document.querySelectorAll(".cell[row='"+row+"']");
            cells.forEach = Array.prototype.forEach;
            return cells;
        },
        getColumn: function(col) {
            var cells = document.querySelectorAll(".cell[col='"+col+"']");
            cells.forEach = Array.prototype.forEach;
            return cells;
        },

        populateRandom: function() {
            var cell = this.getFreeCell();
            if (cell) {
                cell.setAttribute('type', Math.random()>0.5 ? 'pill' : 'infection');
                cell.setAttribute('level', 1);
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

        q: function(el, a, f, t) {
            var classes = a.split(' ');
            for (var i=0; i < classes.length; i++) {
                classes[i] = 'anim-' + classes[i];
                el.classList.add(classes[i]);
            }
            setTimeout(function() {
                if (f) {
                    f();
                }
                for (var i=0; i < classes.length; i++) {
                    el.classList.remove(classes[i]);
                }
            }, t || CONF.ANIM_SPEED);
        },

        moveCell: function(cell, other) {
            var first_row = cell.getAttribute('row');
            var first_col = cell.getAttribute('col');

            cell.setAttribute('row', other.getAttribute('row'));
            cell.setAttribute('col', other.getAttribute('col'));

            other.setAttribute('row', first_row);
            other.setAttribute('col', first_col);
        },

        mergeCells: function(cell, other, direction) {
            var level = parseInt(other.getAttribute('level'), 10);
            level += parseInt(cell.getAttribute('level'), 10);
            other.setAttribute('level', level);

            this.q(cell, 'merge-' + direction, function() {
                cell.setAttribute('type', 'free');
                cell.setAttribute('level', '');
            });
            this.q(other, 'grow');
        },

        fightCells: function(cell, other, direction) {
            var pill = parseInt(cell.getAttribute('level'), 10);
            var infection = parseInt(other.getAttribute('level'), 10);

            if (pill >= infection) {
                other.setAttribute('type', 'free');
                other.setAttribute('level', '');
                this.addPoints(100 * infection);
            } else {
                this.mergeCells(cell, other, direction);
                this.loseHealth();
            }

            this.q(cell, 'consume-'+direction, function() {
                cell.setAttribute('type', 'free');
                cell.setAttribute('level', '');
            });
        },

        shiftAllCells: function(direction) {
            var neighbor;
            var grouper, groups;
            var shifted = false;
            if (this.shifting) {
                return;
            }


            this.shifting = true;
            switch (direction) {
                case 'up':
                case 'down':
                    grouper = this.getRow;
                    break;
                case 'left':
                case 'right':
                    grouper = this.getColumn;
                    break;
                default:
                    break;
            }

            switch (direction) {
                case 'up':
                case 'left':
                    groups = [3, 2, 1, 0];
                    break;
                case 'down':
                case 'right':
                    groups = [0, 1, 2, 3];
                    break;
                default:
                    break;
            }
            
            function shiftGroup(cell) {
                if (CONF.DEBUG_SHIFT) {
                    console.log('shift', cell);
                    pillstreak.q(cell, 'highlight', function(){});
                }
                if (cell.getAttribute('type') !== 'free') {
                    neighbor = pillstreak.getNeighbor(cell, direction);
                    if (neighbor) {
                        if (neighbor.getAttribute('type') === 'free') {
                            pillstreak.moveCell(cell, neighbor);
                            shifted = true;
                        } else if (neighbor.getAttribute('type') === cell.getAttribute('type')) {
                            pillstreak.mergeCells(cell, neighbor, direction);
                            shifted = true;
                        } else if (cell.getAttribute('type') === 'pill') {
                            pillstreak.fightCells(cell, neighbor, direction);
                            shifted = true;
                        }
                    }
                }
            }

            function populateIfShifted() {
                if (shifted) {
                    pillstreak.populateRandom();
                }
                pillstreak.shifting = false;
            }

            var t = 0;
            while (groups.length > 0) {
                var i = groups.pop();
                (function(i) {
                    setTimeout(function(){
                        grouper(i).forEach(shiftGroup);
                    }, CONF.SHIFT_SPEED * t);
                    t++;
                })(i);
            }
            setTimeout(populateIfShifted, CONF.SHIFT_SPEED * t);
        },
    };
    return exports;
})();

window.pillstreak.init();
