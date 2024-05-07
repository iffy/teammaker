type Gender =
  | 'M'
  | 'F'
interface Player {
  name: string,
  gender: Gender,
}
interface Team {
  players: Player[],
}
interface Board {
  players: Player[],
  teams: Team[],
  numteams: number,
}
let board: Board = {
  players: [],
  teams: [],
  numteams: 5,
}

function sortBySmallest(teams: Team[]) {
  teams.sort((a, b) => {
    return a.players.length - b.players.length;
  })
}
function smallestTeam(srcteams: Team[]): Team|undefined {
  let teams = [...srcteams]
  teams.sort((a, b) => {
    return a.players.length - b.players.length;
  })
  return teams[0];
}
function inputElement(id: string): HTMLInputElement {
  return document.getElementById(id) as HTMLInputElement
}
function newplayername(): string {
  return inputElement('newplayer-name').value;
}
function addPlayer(gender: Gender) {
  let newplayer_el = inputElement('newplayer-name');
  let name = newplayer_el.value;
  if (name) {
    board.players.push({
      name, gender
    })
  }
  newplayer_el.value = '';
  makeTeams();
  save();
  render();
  newplayer_el.focus();
}
function addAtLeast2(src: Player[]) {
  let teams = [...board.teams];
  let last_team: null|Team = null;
  while (teams.length > 0) {
    sortBySmallest(teams);
    let smallest = teams.shift();
    if (!smallest) {
      break;
    }
    if (!last_team) {
      last_team = smallest;
    }
    if (src.length >= 2) {
      let player1 = src.shift() as Player;
      let player2 = src.shift() as Player;
      smallest.players.push(player1);
      smallest.players.push(player2);
    } else if (src.length > 0) {
      // Only one left, put her in the last group
      let player1 = src.shift() as Player;
      last_team.players.push(player1);
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
    })
  }
  let girls: Player[] = [];
  let boys: Player[] = [];
  let remaining: Player[] = [];
  board.players.forEach(player => {
    if (player.gender === 'F') {
      girls.push(player)
    } else {
      boys.push(player);
    }
  })
  girls = addAtLeast2(girls);
  boys = addAtLeast2(boys);
  remaining = [...girls, ...boys];
  while (remaining.length > 0) {
    let person = remaining.shift() as Player;
    let team = smallestTeam(board.teams);
    if (!team) {
      break;
    } else {
      team.players.push(person);
    }
  }
}
function shuffle<T>(array: T[]) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {

    // Pick a remaining element...
    let randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }
}
function render() {
  makeTeams();
  save();
  try {
    (document.getElementById('debug') as any).innerText = JSON.stringify(board, null, 2);
  } catch(err) {

  }

  let players_el = document.getElementById('player-list');
  if (players_el) {
    let recteamnum = Math.ceil(board.players.length / 5);
    players_el.innerHTML = `Players: ${board.players.length} (recommend ${recteamnum} teams)`;
  }
  board.players.forEach((player, i) => {
    let el = document.createElement('div')
    el.classList.add('player')
    el.innerText = `${player.name} ${player.gender}`
    players_el?.appendChild(el);
    el.addEventListener('click', () => {
      if (confirm(`Remove ${player.name}?`)) {
        board.players.splice(i, 1);
        render();
      }
    })
  })
  let teams_el = document.getElementById('team-list');
  if (teams_el) {
    teams_el.innerHTML = '';
  }
  board.teams.forEach((team, i) => {
    let el = document.createElement('div')
    el.classList.add('team');
    el.innerHTML = `<b>Team ${i+1} (${team.players.length} players)</b>`;
    team.players.forEach((player, i) => {
      let player_el = document.createElement('div');
      player_el.classList.add('team-player');
      player_el.innerText = player.name;
      el.appendChild(player_el);
    })
    teams_el?.appendChild(el);
  })
}
function save() {
  localStorage.setItem('board', JSON.stringify(board));
}
function reset() {
  board = {
    players: [],
    teams: [],
    numteams: 5,
  }
  render();  
}
function load() {
  let item = localStorage.getItem('board');
  try {
    board = JSON.parse(item || '')
  } catch(err) {
  }
  if (board.numteams <= 2) {
    board.numteams = 2;
  }
}
function start() {
  load();
  document.getElementById('addboy')?.addEventListener('click', (ev) => {
    addPlayer('M')
  })
  document.getElementById('addgirl')?.addEventListener('click', (ev) => {
    addPlayer('F')
  })
  document.getElementById('shuffle-btn')?.addEventListener('click', () => {
    shuffle(board.players);
    render();
  })
  document.getElementById('reset-btn')?.addEventListener('click', () => {
    if (confirm("Reset for sure?")) {
      reset();
    }
  })
  document.getElementById('numteams')?.addEventListener('input', () => {
    board.numteams = Number(inputElement('numteams').value || '5');
    if (board.numteams < 2) {
      board.numteams = 2;
    }
    render();
  })
  render();
}
