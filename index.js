"use strict";
let board = {
    players: [],
    teams: [],
    numteams: 5,
};
function smallestTeam() {
    let teams = [...board.teams];
    teams.sort((a, b) => {
        return a.players.length - b.players.length;
    });
    return teams[0];
}
function inputElement(id) {
    return document.getElementById(id);
}
function newplayername() {
    return inputElement('newplayer-name').value;
}
function addPlayer(gender) {
    let newplayer_el = inputElement('newplayer-name');
    let name = newplayer_el.value;
    if (name) {
        board.players.push({
            name, gender
        });
    }
    newplayer_el.value = '';
    makeTeams();
    save();
    render();
    newplayer_el.focus();
}
function addAtLeast2(src) {
    let i = 0;
    for (let i = 0; i < board.teams.length; i++) {
        if (src.length >= 2) {
            let player1 = src.shift();
            let player2 = src.shift();
            board.teams[i].players.push(player1);
            board.teams[i].players.push(player2);
        }
        else if (src.length > 0) {
            // Only one girl left, put her in the last group
            let idx = i === 0 ? 0 : i - 1;
            let player1 = src.shift();
            board.teams[idx].players.push(player1);
        }
    }
    return src;
}
function makeTeams() {
    const numteams = board.numteams;
    board.teams = [];
    for (let i = 0; i < numteams; i++) {
        board.teams.push({
            players: [],
        });
    }
    let girls = [];
    let boys = [];
    let remaining = [];
    board.players.forEach(player => {
        if (player.gender === 'F') {
            girls.push(player);
        }
        else {
            boys.push(player);
        }
    });
    girls = addAtLeast2(girls);
    boys = addAtLeast2(boys);
    remaining = [...girls, ...boys];
    while (remaining.length > 0) {
        let person = remaining.shift();
        let team = smallestTeam();
        if (!team) {
            break;
        }
        else {
            team.players.push(person);
        }
    }
}
function shuffle(array) {
    let currentIndex = array.length;
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]
        ];
    }
}
function render() {
    makeTeams();
    save();
    try {
        document.getElementById('debug').innerText = JSON.stringify(board, null, 2);
    }
    catch (err) {
    }
    let players_el = document.getElementById('player-list');
    if (players_el) {
        let recteamnum = Math.ceil(board.players.length / 5);
        players_el.innerHTML = `Players: ${board.players.length} (recommend ${recteamnum} teams)`;
    }
    board.players.forEach((player, i) => {
        let el = document.createElement('div');
        el.classList.add('player');
        el.innerText = `${player.name} ${player.gender}`;
        players_el === null || players_el === void 0 ? void 0 : players_el.appendChild(el);
        el.addEventListener('click', () => {
            if (confirm(`Remove ${player.name}?`)) {
                board.players.splice(i, 1);
                render();
            }
        });
    });
    let teams_el = document.getElementById('team-list');
    if (teams_el) {
        teams_el.innerHTML = '';
    }
    board.teams.forEach((team, i) => {
        let el = document.createElement('div');
        el.classList.add('team');
        el.innerHTML = `<b>Team ${i + 1} (${team.players.length} players)</b>`;
        team.players.forEach((player, i) => {
            let player_el = document.createElement('div');
            player_el.classList.add('team-player');
            player_el.innerText = player.name;
            el.appendChild(player_el);
        });
        teams_el === null || teams_el === void 0 ? void 0 : teams_el.appendChild(el);
    });
}
function save() {
    localStorage.setItem('board', JSON.stringify(board));
}
function reset() {
    board = {
        players: [],
        teams: [],
        numteams: 5,
    };
    render();
}
function load() {
    let item = localStorage.getItem('board');
    try {
        board = JSON.parse(item || '');
    }
    catch (err) {
    }
    if (board.numteams <= 2) {
        board.numteams = 2;
    }
}
function start() {
    var _a, _b, _c, _d, _e;
    load();
    (_a = document.getElementById('addboy')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', (ev) => {
        addPlayer('M');
    });
    (_b = document.getElementById('addgirl')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', (ev) => {
        addPlayer('F');
    });
    (_c = document.getElementById('shuffle-btn')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => {
        shuffle(board.players);
        render();
    });
    (_d = document.getElementById('reset-btn')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => {
        if (confirm("Reset for sure?")) {
            reset();
        }
    });
    (_e = document.getElementById('numteams')) === null || _e === void 0 ? void 0 : _e.addEventListener('input', () => {
        board.numteams = Number(inputElement('numteams').value || '5');
        if (board.numteams < 2) {
            board.numteams = 2;
        }
        render();
    });
    render();
}
