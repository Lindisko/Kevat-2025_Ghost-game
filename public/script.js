const BOARD_SIZE = 20;
const cellSize = calculateCellSize();
let board;
let player;
let ghosts = [];
let ghostSpeed = 1000;
let isGameRunning = false;
let ghostInterval;
let ghostCount = 5;
let score = 0;

document.getElementById('new-game-btn').addEventListener('click',startGame);

document.addEventListener('keydown', (event)=>{
    if(isGameRunning === false){
        return;
    }
    switch(event.key){
        case 'ArrowUp':
            player.move(0,-1);
        break;
        case 'ArrowDown':
            player.move(0,1);
        break;
        case 'ArrowLeft':
            player.move(-1,0);
        break;
        case 'ArrowRight':
            player.move(1,0);
        break;
        case 'w':
            shootAt(player.x, player.y -1)
        break;
        case 'a':
            shootAt(player.x -1, player.y)
        break;
        case 's':
            shootAt(player.x, player.y +1)
        break;
        case 'd':
            shootAt(player.x +1, player.y)
        break;
    }
    event.preventDefault();
});

function startGame(){
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    player = new Player(0,0);
    board = generateRandomBoard();
    drawBoard(board);
    ghostSpeed = 1000;
    ghostCount = 5;
    ghostInterval = setInterval(moveGhosts, ghostSpeed);
    isGameRunning = true;
    score = 0;
    updateScoreBoard(0);
}
function generateRandomBoard(){
    const newBoard = Array.from({length:BOARD_SIZE}, ()=> Array(BOARD_SIZE).fill(' '));
    for(let y = 0; y < BOARD_SIZE; y++){
        for(let x = 0; x < BOARD_SIZE; x++){
            if(y === 0 || y === BOARD_SIZE - 1 || x === 0 || x === BOARD_SIZE - 1){
            newBoard[y][x] = 'T';
            }
        }
    }

    generateObstacles(newBoard);
    const [playerX, playerY] = randomEmptyPosition(newBoard);
    setCell(newBoard, playerX, playerY, 'P');
    player.x = playerX;
    player.y = playerY;
    ghosts = [];
    for(let i = 0; i < ghostCount; i++){
        const[ghostX, ghostY] = randomEmptyPosition(newBoard);
        setCell(newBoard, ghostX, ghostY, 'G');
        ghosts.push(new Ghost(ghostX,ghostY));
    }

    console.log(newBoard);
    return newBoard;
}

function drawBoard(board){
    const gameBoard = document.getElementById('game-board');
    gameBoard.style.gridTemplateColumns = `repeat(${BOARD_SIZE},1fr)`;
    gameBoard.innerHTML = "";
    for(let y = 0; y < BOARD_SIZE; y++){
        for(let x = 0; x < BOARD_SIZE; x++){
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.width = cellSize + "px";
            cell.style.height = cellSize + "px";
            if(getCell(board, x, y) === 'T'){
                cell.classList.add('wall');
            }else if(getCell(board,x,y) === 'P'){
                cell.classList.add('player');
            }else if(getCell(board,x,y) === 'G'){
                cell.classList.add('ghost')
            }else if(getCell(board,x,y) === 'B'){
                cell.classList.add('bullet');
                setTimeout(()=>{
                    setCell(board, x, y, ' ');
                }, 500);
            }
            gameBoard.appendChild(cell);
        }
    }
}

function getCell(board, x, y){
    return board[y][x];
}

function calculateCellSize(){
    const screenSize = Math.min(window.innerWidth, window.innerHeight);
    const gameBoardSize = 0.95 * screenSize;

    return gameBoardSize/BOARD_SIZE;
}

function generateObstacles(board){
    const obstacles = [
        [[0,0],[0,1],[1,0],[1,1]],
        [[0,0],[0,1],[0,2],[0,3]],
        [[0,0],[1,0],[2,0],[1,1]],
        [[0,0],[2,0],[1,1],[0,2],[1,2]],
        [[0,0],[1,4],[3,0],[1,1]],
        [[0,0],[1,1],[2,2],[3,3]],
        [[0,0],[1,5],[2,4],[1,1]],

    ];

    const position = [
        {startX: 2, startY: 2},
        {startX: 8, startY: 2},
        {startX: 3, startY: 10},
        {startX: 10, startY: 15},
        {startX: 13, startY: 8},
        {startX: 16, startY: 2},
        {startX: 6, startY: 14},
        {startX: 3, startY: 2},
        {startX: 9, startY: 7},
        {startX: 4, startY: 4},
        {startX: 11, startY: 12},
        {startX: 14, startY: 5},
        {startX: 15, startY: 1},
        {startX: 7, startY: 13},
    ];

    position.forEach(pos =>{
        const randomObstacle = obstacles[Math.floor(Math.random() * obstacles.length)];
        placeObstacles(board,randomObstacle,pos.startX,pos.startY);
    });
}

function placeObstacles(board, obstacles, startX, startY){
    for(coordinatePair of obstacles){
        [x,y] = coordinatePair;
        board[startY + y][startX + x] = 'T';
    }
}

function randomInt(min,max){
    return Math.floor(Math.random() * (max - min +1)) +min;
}

function randomEmptyPosition(board){
    x = randomInt(1,BOARD_SIZE - 2);
    y = randomInt(1,BOARD_SIZE - 2);
    if(getCell(board,x,y) === ' '){
        return[x,y];
    }
    else{
        return randomEmptyPosition(board);
    }
}

function setCell(board,x,y,value){
    board[y][x] = value;
}

function shootAt(x,y){
    if(getCell(board,x,y) === 'T'){
        return;
    }

    const ghostIndex = ghosts.findIndex(ghost => ghost.x === x && ghost.y === y);

    if(ghostIndex !== -1){
        ghosts.splice(ghostIndex,1);
        updateScoreBoard(50);
    }

    setCell(board,x,y, 'B');
    drawBoard(board);

    if(ghosts.length === 0){
        startNextLevel();
    }
}

function moveGhosts(){
    const oldGhosts = ghosts.map(ghost=>({x:ghost.x, y:ghost.y}))
    ghosts.forEach(ghost =>{
        const newPosition = ghost.moveGhostTowardsPlayer(player,board,oldGhosts);
        ghost.x = newPosition.x;
        ghost.y = newPosition.y;
        
        setCell(board, ghost.x, ghost.y, 'G');

        oldGhosts.forEach(ghost =>{
            setCell(board, ghost.x, ghost.y, ' ');
        });

        ghosts.forEach(ghost =>{
        setCell(board, ghost.x, ghost.y, 'G');
        if(ghost.x === player.x && ghost.y === player.y){
            endGame();
            return;
        }
        });

        drawBoard(board);
    });
}

function endGame(){
    isGameRunning = false;
    clearInterval(ghostInterval);
    document.getElementById('intro-screen').style.display = 'block';
    document.getElementById('game-screen').style.display = 'none';
}

function updateScoreBoard(points){
    const scoreBoard = document.getElementById('score-board')
    score += points;
    scoreBoard.textContent = `Score: ${score}`;
}

function startNextLevel(){
    alert('Nästa nivå!');

    ghostCount++;

    board = generateRandomBoard();
    drawBoard(board);

    ghostSpeed = ghostSpeed * 0.9;

    clearInterval(ghostInterval);
    setTimeout(()=>{
        ghostInterval = setInterval(moveGhosts,ghostSpeed);
    },1000);
}
class Player{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
    move(deltaX,deltaY){
        const currentX = player.x;
        const currentY = player.y;
        
        const newX = currentX + deltaX;
        const newY = currentY + deltaY;
        if(getCell(board,newX,newY) === ' '){
            player.x = newX;
            player.y = newY;
    
            setCell(board,currentX,currentY, ' ');
            setCell(board, newX, newY, 'P');
            drawBoard(board);
        }
    }
}

class Ghost{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }

    moveGhostTowardsPlayer(player, board, oldGhosts){
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        let moves = [];

        if(Math.abs(dx)> Math.abs(dy)){
            if(dx > 0)moves.push({x: this.x +1, y: this.y});
            else moves.push({x: this.x -1, y: this.y});

            if(dy > 0)moves.push({x: this.x, y: this.y +1});
            else moves.push({x: this.x, y: this.y -1});
        }else{
            if(dy > 0)moves.push({x: this.x, y: this.y +1});
            else moves.push({x: this.x, y: this.y -1});

            if(dx > 0)moves.push({x: this.x +1, y: this.y});
            else moves.push({x: this.x -1, y: this.y});
        }
        for(let move of moves){
            const value = getCell(board, move.x, move.y);
            if(value === ' ' || value === 'P' && !oldGhosts.some(g => g.x === move.x && g.y === move.y)){
                return move;
            }
        }
        return{x: this.x, y: this.y};
    }
}