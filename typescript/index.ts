//在cmd，ts文件路径下输入 tsc --init；生成tsconfig.json文件; 可以在注释中修改"outDir"
//运行：终端-运行任务-监视
//浏览器打开html\

//cttl+c:退出命令行
//终端运行命令：tsc index.ts & node index.js

//import * as readlineSync from 'readline-sync';
import { format, formatDistance, formatRelative, subDays } from 'date-fns';
import {PlayOthello} from './implement';
//import { isMainThread } from 'worker_threads';
//import { exists } from 'fs';


(async function main() {
    //let board:number = Number(await question('Enter the board dimension:'));
    //=================================================================
    //获取输入
    
    let readlineSync = require('readline-sync');

    let board:number = Number(readlineSync.question('Enter the board dimension:'));
    var arr:Array<number>=[2,4,6,8,10];
    while(arr.indexOf(board)===-1){
        console.log("Please enter 2,4,6,8 or 10!");
        board = Number(readlineSync.question('Enter the board dimension:'));
    }
    //process.stdout.write(String(board)+'\n');
    
    let first:string = readlineSync.question('Computer plays (X/O): ');
    var arr1:Array<string>=['X','O'];
    while(arr1.indexOf(first)===-1){
        console.log("Please enter X or O! X: BLACK, O: WHITE.")
        first = readlineSync.question('Computer plays (X/O): ');
    }
    //process.stdout.write(first+'\n');
    

    var othello = new PlayOthello(board, first, 'X');
    //var othello = new PlayOthello(4, 'O', 'X');
    othello.output_board();  // 输出初始棋盘
    
    //csv文件
    var fs = require('fs');

    //运行游戏
    var flag = 1;
    while(flag != 0 && flag != 3){
        var begin_time = format(new Date(), 'yyyyMMdd HH:mm:ss');
        var startTime = new Date().getTime(); // 开始时间
        if(othello._player == othello._computer_turn){//computer turn
            var this_player = "computer";
            var opp_player = "human";
        }
        else{
            var this_player = "human";
            var opp_player = "computer";
        }
     
        //下棋
        flag = Number(othello.start_the_game());

        //保存为csv文件
        if(flag == 2 || flag == 3){
            var endTime = new Date().getTime();  // 结束时间
            var use_time = endTime - startTime;  // 时间差，毫秒
            
            var content = [begin_time, use_time, String(board) + '*' + String(board), this_player, opp_player].join(",") + "\n"; 
            fs.writeFile('./reversi.csv', content, { flag: 'a+' }, function (err: any) {
                if (err) {
                    console.error(err);
                    return;
                }   
            });
        }      
    }  
})();
