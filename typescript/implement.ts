import * as readlineSync from 'readline-sync';

//自定义错误类型，继承error
class WrongInput extends Error {
    constructor() {
      super();
      this.name = "WrongInput";
    }
}
class OthelloGameOver extends Error {
    constructor() {
      super();
      this.name = "OthelloGameOver";
    }
}
class NoValidMovesLeft extends Error {
    constructor() {
      super();
      this.name = "NoValidMovesLeft";
    }
}
class InvalidOthelloGameMove extends Error {
    constructor() {
      super();
      this.name = "InvalidOthelloGameMove";
    }
}
class GameBoardLocationUnEmpty extends Error {
    constructor() {
      super();
      this.name = "GameBoardLocationUnEmpty";
    }
}

////////////////////////////////////////////////////////////////

export class PlayOthello{
    board_row: number;
    _computer_turn: string;
    _player: string;
    _white: string;
    _black: string;
    _NONE: string;
    board: any;
    
    constructor(num_row:number, computer_turn:string, first_player:string){

        this.board_row = num_row;
        this._computer_turn = computer_turn;
        this._player = first_player;

        this._white = ' O ';
        this._black = ' X ';
        this._NONE = ' . ';

        this.board = this.newboard();
    }

    output_board(){
        let aValue = 97;
        let aValueString = String.fromCharCode(aValue);

        for(var i=0; i < this.board_row + 1; i++){
            for(var j=0; j < this.board_row + 1; j++){
                if (i === 0){
                    if (j === 0){
                        process.stdout.write('  ');
                    }
                    else{
                        process.stdout.write(' ' + String.fromCharCode(aValue + j-1) + ' ');
                    }
                }
                else{
                    if (j === 0){
                        process.stdout.write(String.fromCharCode(aValue + i-1) + ' ');
                    }
                    else{
                        process.stdout.write(this.board[i-1][j-1]);
                    }
                }      
            }       
            process.stdout.write("\n");     
        }
    }

    newboard(){
        //创建初始棋盘，初始化this.board
        var board:Array<Array<any>> = new Array<Array<any>>();

        for(var row=0; row < this.board_row; row++){
            board.push([]);
            for(var col=0; col < this.board_row; col++){
                board[row].push(this._NONE);
            }
        }
        
        board[Math.floor((this.board_row - 2)/2)][Math.floor((this.board_row - 2)/2)] = this._white;
        board[Math.floor((this.board_row - 2)/2 + 1)][Math.floor((this.board_row - 2)/2 + 1)] = this._white;
        board[Math.floor((this.board_row - 2)/2)][Math.floor((this.board_row - 2)/2 + 1)] = this._black;
        board[Math.floor((this.board_row - 2)/2 + 1)][Math.floor((this.board_row - 2)/2)] = this._black;
        
        return board;
    }
   
    get_row_col(){ //输入:如ab这样的字符串
        if(this._computer_turn == 'O'){   
            var s:string = String(readlineSync.question('Enter move for X (RowCol):'));  
            process.stdout.write(s);
            //var s =await getinput("Enter move for X (RowCol):");
        }
        else{
            var s:string = String(readlineSync.question('Enter move for X (RowCol):'));  
            process.stdout.write(s);
            //var s = await getinput("Enter move for O (RowCol):");
        }
        if(s.length != 2){
            throw new WrongInput();
        }
        else{
            var i = s[0].charCodeAt(0) - 97; //char2ascii
            var j = s[1].charCodeAt(0) - 97;
            if(!(i >= 0 && i < this.board_row) || !(j >= 0 && j < this.board_row)){
                throw new WrongInput();
            }  
            else{
                //process.stdout.write(String(i)+String(j));
                return [i,j];
            }
        }
    }
   
    start_the_game(){
        //主要函数，开始游戏
        try{
            this.check_allboard();//有报错
            if(this._player == this._computer_turn){  // 电脑下
                this.computer_play();
            }
            else{  // 人下
                try{
                    //可能出错begin
                    var l1 = this.get_row_col();
                    var i = l1[0];
                    var j = l1[1];
                    var row = Number(i);
                    var col = Number(j);
                    //end
                    try{  
                        this.drop_piece(row + 1, col + 1);//可能出错
                        process.stdout.write('\n');
                        this.output_board();
                    }

                    catch(err){
                        if (err.name == "InvalidOthelloGameMove") {// 下错地儿，直接电脑赢
                            process.stdout.write("\nInvalid move.\nGame over.\n" +  this._computer_turn.trim() + " player wins."+"\n");//去除两端空格
                            return 3;
                        }

                        if (err.name == "GameBoardLocationUnEmpty") {// 下的地方有子
                            process.stdout.write("\nInvalid move.The location is not empty!\n");
                            return 1;
                        }
                    }
                }
                catch(err){ 
                    if (err.name == "WrongInput") {
                        process.stdout.write("\nPlease enter the row and col correctly! (e.g.: ab)"+"\n");
                        return 1;
                    }
                }                   
            }
            return 2;
        }
        catch(err){
            if (err.name == "OthelloGameOver") {//两个都无路可走
                process.stdout.write('Both players have no valid move.\nGame over.\n');
                let l = this.winner_othello();
                var winner = l[0];
                var black = l[1];
                var white = l[2]; 
                process.stdout.write("X : O = " + String(black) + " : " + String(white) + '\n');
                if(winner === ''){
                    process.stdout.write("Draw!");
                }
                else{
                    process.stdout.write(winner + ' player wins.');
                }
                
                return 0;
            }
            if (err.name == "NoValidMovesLeft") {// 一个无路可走，另一个继续走
                process.stdout.write(this._opposite_player() + " player has no valid move.");
                return 1;
            }
        }          
    }

    computer_play(){  // 调用之前已经检查是否有地方可以下
    // 相同，先行小再列小
        var max:number = 0;
        var max_row:number = 99;
        var max_col:number = 99;

        for(var row=0; row < this.board_row; row++){
            for(var col=0; col < this.board_row; col++){
                if(this.board[row][col] === this._NONE){
                    try{
                        var count = this.computer_drop_piece(row + 1, col + 1);//有错误代码
                        //如果正确，执行
                        if(count > max){
                            max = count;
                            max_row = row;
                            max_col = col;
                            //console.log(max);
                        }
                    }
                    catch{
                        continue;
                    }        
                }
            }
        }
        //print(max,max_row, max_col, self.board[max_row ][max_col])
        this.drop_piece(max_row + 1,max_col + 1);
        process.stdout.write("Computer places " + this._computer_turn + " at " +  String.fromCharCode(max_row + 97) + String.fromCharCode(max_col + 97)+'\n');
        this.output_board();
    }

    drop_piece(row: number, col: number){
        //检查位置row，col是否可以下，可以的话下棋并更新棋盘，不可以的话报错
        var flip:Array<Array<any>> = new Array<Array<any>>();
        
        flip = flip.concat(this.check_and_flip(row, col));//拼接在后面

        this.board[row - 1][col - 1] = ' ' + this._player + ' ';

        for(var index=0; index < flip.length; index++){
            this.board[flip[index][0]][flip[index][1]] = ' ' + this._player + ' ';
        }

        this._player = this._opposite_player();
    }   
    computer_drop_piece(row: number, col: number){
        //computer自动下棋
        var flip:Array<Array<any>> = new Array<Array<any>>();
            
        flip = flip.concat(this.check_and_flip(row, col));//拼接在后面
        var tmpboard = JSON.parse(JSON.stringify(this.board));//!!深拷贝 https://blog.csdn.net/a42626423/article/details/88990250 
        
        tmpboard[row - 1][col - 1] = ' ' + this._player + ' ';

        for(var index=0; index < flip.length; index++){
            tmpboard[flip[index][0]][flip[index][1]] = ' ' + this._player + ' ';
        }
        //console.log(tmpboard);
        if(this._player === 'X'){
            //console.log(this.computer_count_tiles(tmpboard))
            return this.computer_count_tiles(tmpboard)[0];
        }
        else{
            return this.computer_count_tiles(tmpboard)[1];
        }
    }

    check_allboard(){
        //检查所有棋盘，查看是否还有player有地方走
        
        if(this.check_all_valid().length == 0){
            this._player = this._opposite_player();
            if(this.check_all_valid().length == 0){
                throw new OthelloGameOver();
            }
            else{
                throw new NoValidMovesLeft();
            }
        }
    }

    check_all_valid(){
        //检查所有棋盘，返回所有valid moves的list
        
        var flip:Array<Array<any>> = new Array<Array<any>>();
        for(var row=0; row < this.board_row; row++){
            for(var col=0; col < this.board_row; col++){
                if(this.board[row][col] === this._NONE){
                    try{
                        flip = flip.concat(this.check_and_flip(row + 1, col + 1));
                    }
                    catch{
                        continue;
                    }            
                }
            }
        }
        return flip;
    }

    check_and_flip(row: number, col: number){
        //从8个方向检查是否合法

        if(this.board[row-1][col-1] === this._NONE){

            var flip:Array<Array<any>> = new Array<Array<any>>();

            flip = flip.concat(this._flip(row, col, 0, 1));
            flip = flip.concat(this._flip(row, col, 1, 1));
            flip = flip.concat(this._flip(row, col, 1, 0));
            flip = flip.concat(this._flip(row, col, 1, -1));
            flip = flip.concat(this._flip(row, col, 0, -1));
            flip = flip.concat(this._flip(row, col, -1, -1));
            flip = flip.concat(this._flip(row, col, -1, 0));
            flip = flip.concat(this._flip(row, col, -1, 1));

            if(flip.length === 0){
                throw new InvalidOthelloGameMove();
            }
            else{
                return flip;
            }
           
        }
        else{
            throw new GameBoardLocationUnEmpty();
        }
    }

    _flip(row: number, col: number, rowdelta: number, coldelta: number){
        //从一个方向检查是否合法

        row = row - 1;
        col = col - 1;

        var opp = this._opposite_player();

        var flip:Array<Array<any>> = new Array<Array<any>>();

        while(1){

            row = row + rowdelta
            col = col + coldelta
            if ((-1 < row && row < this.board_row) && (-1 < col && col < this.board_row)){
                if(this.board[row][col].trim() === opp){
                    flip.push([row, col]);
                }
                else if(this.board[row][col].trim() === this._player){
                    break;
                }
                else{
                    flip = [];
                    break;
                }
            }
            else{
                flip = [];
                break;
            }
        }
        return flip;
    }

    winner_othello(){
        //返回获胜的颜色，平手返回空str

        var no_black_tiles = this.count_tiles()[0];
        var no_white_tiles = this.count_tiles()[1];

        var winner = '';

    
        if(no_black_tiles > no_white_tiles){
            winner = 'X';
        }
        else if(no_white_tiles > no_black_tiles){
            winner = 'O';
        }
        return [winner, no_black_tiles, no_white_tiles];
    }

    count_tiles(){
        //计算黑棋和白棋的个数

        var black = 0;
        var white = 0;

        for(var row=0; row < this.board_row; row++){
            for(var col=0; col < this.board_row; col++){
                if(this.board[row][col].trim() === 'O'){
                    white += 1;
                }
                else if(this.board[row][col].trim() === 'X'){
                    black += 1;
                }
            }
        }

        return [black, white];
    }

    computer_count_tiles(tmpboard:Array<Array<any>>){
        //computer下时，计算黑棋和白棋的个数

        var black = 0;
        var white = 0;

        for(var row=0; row < this.board_row; row++){
            for(var col=0; col < this.board_row; col++){
                if(tmpboard[row][col].trim() === 'O'){
                    white += 1;
                }
                else if(tmpboard[row][col].trim() === 'X'){
                    black += 1;
                }
            }
        }
        return [black, white];
    }

    _opposite_player(){
        //轮到对手下

        if(this._player === 'O'){
            return 'X';
        }
        return 'O';
    }
}