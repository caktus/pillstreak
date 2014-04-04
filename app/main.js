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
        TICK: 100,
        INFECTION_RATE: 0.4,
        DEBUG_SHIFT: false,
    }

    var INSTRUCTIONS = [
        "You are not well.",
        "But, you are not powerless!",
        "Combine pills to form Good Habits.",
        "Avoid letting the infection spread.",
        "The stronger the infection...",
        "the better you'll have to be with your pills.",
        "Swipe or use arrow keys to move.",
        "Swipe or use arrow keys to move.",
        "Swipe or use arrow keys to move.",
    ];

    var exports = {
        init: function() {
            this.$game = document.querySelector('#game');
            this.$$cells = document.querySelectorAll(".cell");
            this.$points = document.querySelector('#points');
            this.$high = document.querySelector('#high');
            this.$health = document.querySelector('#health_points');
            this.$info = document.querySelector('#info');
            this.$infoText = document.querySelector('#info-text');
            this.$restart = document.querySelector('#restart');

            this.lost = false;
            this.$restart.classList.add('hidden');
            this.$points.innerHTML = '0';
            this.$health.innerHTML = '10';

            var i, row, col;
            for (i=0; i<this.$$cells.length; i++) {
                row = i % 4;
                col = parseInt(i / 4, 10);
                this.$$cells[i].setAttribute('type', 'free');
                this.$$cells[i].setAttribute('row', row);
                this.$$cells[i].setAttribute('col', col);
                this.$$cells[i].setAttribute('level', '');
            }

            pillstreak.populateRandom('infection');
            pillstreak.populateRandom('infection');
            pillstreak.populateRandom('infection');
            pillstreak.populateRandom('infection');

            this.$game.focus();
            document.body.onkeyup = function(ev) {
                pillstreak.shiftAllCells(KEYS[ev.keyCode])
            };

            Hammer(document.body, {
                swipe: true,
                swipe_velocity: 0.1,
            }).on('swipeup swipedown swipeleft swiperight', function(ev) {
                pillstreak.shiftAllCells(ev.gesture.direction);
            });

            document.body.ontouchstart = function(ev) {
                ev.preventDefault();
            };

            setInterval(function() {
                pillstreak.tick();
            }, CONF.TICK);

            this.runInstructions();
        },
        restart: function() {
            for (var i=0; i<this.$$cells.length; i++) {
                this.setCell(this.$$cells[i], {type: 'free', level: ''});
            }
            this.$game.classList.remove('lost');
            this.init();
        },

        info: function(text) {
            if (text) {
                this.$infoText.innerHTML = text;
                this.$info.classList.remove('hidden');
            } else {
                this.$info.classList.add('hidden');
            }
        },
        runInstructions: function() {
            this.instructionStep = 0;

            var i = setInterval(function() {
                var step = INSTRUCTIONS[pillstreak.instructionStep];
                if (step) {
                    pillstreak.info(step);
                    pillstreak.instructionStep++;
                } else {
                    pillstreak.info();
                    clearInterval(i);
                }
            }, 2000);
        },

        ticks: 0,
        tick: function() {
            this.ticks++;
            var inf = 0;
            var virii = document.querySelectorAll('[type=infection]');
            for (var i=0; i < virii.length; i++) {
                inf += parseInt(virii[i].getAttribute('level'), 10);
            }
            var thresh = 1.00 - (0.025 * inf);
            if (Math.random() > thresh) {
                var cell = this.getOccupiedCell('infection');
                this.q(cell, 'grow');
            }

            if (this.ticks % 10 === 0) {
                this.q(document.body, 'pulse');
            }

            if (this.lost) {
                this.$game.classList.add('lost');
                this.$restart.classList.remove('hidden');

                var pill = this.getOccupiedCell('pill');
                if (pill) {
                    this.setCell(pill, {type: 'infection'});
                } else {
                    var free = this.getFreeCell();
                    if (free) {
                        this.setCell(free, {type: 'infection', level: 1});
                    }
                }
            }
        },

        addPoints: function(points) {
            var cur = parseInt(this.$points.innerHTML, 10);
            this.$points.innerHTML = cur + points;

            var high = parseInt(this.$high.innerHTML, 10);
            this.$high.innerHTML = Math.max(high, cur + points);
        },
        loseHealth: function() {
            var cur = parseInt(this.$health.innerHTML, 10);
            this.$health.innerHTML = cur - 1;
            if (cur - 1 === 0) {
                // lost the game!
                this.lost = true;
                this.info("The infection has won...");
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
        getOccupiedCell: function(type) {
            var cell = [];
            for (var i=0; i<this.$$cells.length; i++) {
                if (type && type === this.$$cells[i].getAttribute('type')) {
                    cell.push(this.$$cells[i]);
                } else if (!type && this.$$cells[i].getAttribute('type') !== 'free') {
                    cell.push(this.$$cells[i]);
                }
            }
            if (cell.length > 0) {
                return cell[ parseInt(cell.length * Math.random(), 10) ];
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

        populateRandom: function(type) {
            type = type || (Math.random() > CONF.INFECTION_RATE ? 'pill' : 'infection');
            var cell = this.getFreeCell();
            if (cell) {
                cell.setAttribute('type', type);
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
            setTimeout(populateIfShifted, CONF.SHIFT_SPEED * 8);
        },
    };
    return exports;
})();

window.pillstreak.init();
