import copy

### EXCEPTION CLASSES (RAISED WHENEVER REQUIRED BY GAME LOGIC)

class InvalidOthelloGameMove(Exception):
    '''Raised whenever a player attempts to make an invalid move'''

    pass

class GameBoardLocationUnEmpty(Exception):
    '''Raised when a player tries to put disk at an unempty location'''
    pass

class NoValidMovesLeft(Exception):
    '''Raised when a player has no valid moves left on the game board'''
    pass

class OthelloGameOver(Exception):
    '''Raised when both the players have no valid moves left and the game
    is over'''
    pass

class WrongInput(Exception):
    '''Raised when both the players have no valid moves left and the game
    is over'''
    pass


### CLASS FOR GAME LOGIC

class PlayOthello:

    def __init__(self, num_row, computer_turn, top_left, first_player,
                 win_condition):
        '''Initializes all the attributes of the class'''

        self.board_row = num_row
        self._computer_turn = computer_turn
        self._top_left = top_left
        self._player = first_player
        self._win_condition = win_condition

        self._white = ' O '
        self._black = ' X '
        self._NONE = ' . '
        
        self.board = self.newboard()

    def output_board(self):
        for i in range(self.board_row + 1):

            for j in range(self.board_row + 1):
                if i == 0:
                    if j == 0:
                        print('    ', end='')
                    else:
                        print(chr(97 + j-1), ' ',end='')
                else:
                    if j == 0:
                        print(chr(97 + i-1), ' ',end='')
                    else:
                        print(self.board[i-1][j-1], end='')
            print("\n")


    def newboard(self) -> [[str]]:
        '''Constructs and returns a new game board for the game Othello'''

        board = []

        for row in range(self.board_row):
            board.append([])
            for col in range(self.board_row):
                board[-1].append(self._NONE)


        if self._top_left == 'W':
            
            board[(self.board_row - 2)//2][(self.board_row - 2)//2] \
                                   = self._white
            board[(self.board_row - 2)//2 + 1][(self.board_row - 2)//2 + 1] \
                                   = self._white
            board[(self.board_row - 2)//2][(self.board_row - 2)//2 + 1] \
                                   = self._black
            board[(self.board_row - 2)//2 + 1][(self.board_row - 2)//2] \
                                   = self._black
            
        else:
            
            board[(self.board_row - 2)//2][(self.board_row - 2)//2] \
                                   = self._black
            board[(self.board_row - 2)//2 + 1][(self.board_row - 2)//2 + 1] \
                                   = self._black
            board[(self.board_row - 2)//2][(self.board_row - 2)//2 + 1] \
                                   = self._white
            board[(self.board_row - 2)//2 + 1][(self.board_row - 2)//2] \
                                   = self._white
            
        return board


    def get_row_col(self): # 输入是如ab这样的字符串
        if self._computer_turn == 'O':
            s = input("Enter move for X (RowCol):")
        else:
            s = input("Enter move for O (RowCol):")

        if len(s) != 2:

            raise WrongInput
        else:
            i = ord(s[0]) - 97
            j = ord(s[1]) - 97
            if i not in range(self.board_row) or j not in range(self.board_row):
                raise WrongInput
            else:
                #print(i,j)
                return i, j


    def start_the_game(self):
        try:
            self.check_allboard()
        except OthelloGameOver:  # 两个都无路可走
            print('Both players have no valid move.\nGame over.')
            winner, black, white = self.winner_othello()
            print("X : O =", str(black), ":", str(white))
            if winner == '':
                print("Draw!")
            else:
                print(winner, 'player wins.')
            exit(0)

        except NoValidMovesLeft:  # 一个无路可走，另一个继续走
            print(self._opposite_player(),'player has no valid move.',end='')

        else:
            if self._player == self._computer_turn:  # 电脑下
                self.computer_play()
            else:  # 人下
                try:
                    row, col = self.get_row_col()
                except WrongInput:
                    print("Please enter the row and col correctly! (e.g.: ab)")
                else:
                    try:
                        self.drop_piece(row + 1, col + 1)

                    except InvalidOthelloGameMove:  # 下错地儿，直接电脑赢
                        print("Invalid move.\nGame over.\n", self._computer_turn.strip(), "player wins.")
                        exit(0)

                    except GameBoardLocationUnEmpty:  # 下的地方有子
                        print('Invalid move.The location is not empty!')
                    else:
                        self.output_board()

    def computer_play(self):  # 调用之前已经检查是否有地方可以下
        # 相同，先行小再列小
        max = 0
        max_row = 99
        max_col = 99

        for row in range(self.board_row):
            for col in range(self.board_row):

                if self.board[row][col] == self._NONE:

                    try:
                        count = self.computer_drop_piece(row + 1, col + 1)
                    except:
                        continue
                    else:
                        if count > max:
                            max = count
                            max_row = row
                            max_col = col
        #print(max,max_row, max_col, self.board[max_row ][max_col])
        self.drop_piece(max_row + 1,max_col + 1)
        print("Computer places", self._computer_turn, "at", chr(max_row + 97) + chr(max_col + 97))
        self.output_board()


    def drop_piece(self, row: int, col: int) -> None:
        '''Takes a row and column, checks whether the player's move is valid
        at that location and if it is inserts the player's tile at that
        location and flips the corresponding tiles. If the move is invalid
        it raises an error'''

        flip = []
        
        flip.extend(self.check_and_flip(row, col))

        self.board[row - 1][col - 1] = ' ' + self._player + ' '

        for index in flip:
            self.board[index[0]][index[1]] = ' ' + self._player + ' '

        self._player = self._opposite_player()

    def computer_drop_piece(self, row: int, col: int):
        '''Takes a row and column, checks whether the player's move is valid
        at that location and if it is inserts the player's tile at that
        location and flips the corresponding tiles. If the move is invalid
        it raises an error'''
        #print(row,col,self.board[row-1][col-1])
        flip = []

        flip.extend(self.check_and_flip(row, col))

        tmpboard = copy.deepcopy(self.board) # 多层列表，里面层储存的是地址，所以直接赋值相当于浅复制，两个会一起改变；深复制则不会
        tmpboard[row - 1][col - 1] = ' ' + self._player + ' '

        for index in flip:
            tmpboard[index[0]][index[1]] = ' ' + self._player + ' '

        if self._player == 'X':
            #print(self.computer_count_tiles(tmpboard))
            return self.computer_count_tiles(tmpboard)[0]
        else:
            return self.computer_count_tiles(tmpboard)[1]

    def check_allboard(self) -> None:
        '''Checks whether any valid moves are left or not, for both the
        players and raises errors appropriately'''
        if self.check_all_valid() == []:
            self._player = self._opposite_player()
            if self.check_all_valid() == []:
                raise OthelloGameOver
            
            else:
                raise NoValidMovesLeft

    def check_all_valid(self) -> list:
        '''Checks whether a player has any valid moves left on the game
        board, by calling the method check_and_flip on every empty location
        on the game board, and depending upon the result appropriately
        raise errors or returns a list of all valid moves'''
        
        flip = []

        for row in range(self.board_row):
            for col in range(self.board_row):

                if self.board[row][col] == self._NONE:

                    try:
                        flip.extend(self.check_and_flip(row + 1, col + 1))
                    except:
                        continue

        return flip

    def check_and_flip(self, row: int, col: int) -> list:
        '''Checks whether the move, that a player is trying to make, is
        valid or not, by calling the method _flip 8 times, thereby
        checking the validity of the move in all 8 directions'''

        if self.board[row-1][col-1] == self._NONE:

            flip = []

            flip.extend(self._flip(row, col, 0, 1))
            flip.extend(self._flip(row, col, 1, 1))
            flip.extend(self._flip(row, col, 1, 0))
            flip.extend(self._flip(row, col, 1, -1))
            flip.extend(self._flip(row, col, 0, -1))
            flip.extend(self._flip(row, col, -1, -1))
            flip.extend(self._flip(row, col, -1, 0))
            flip.extend(self._flip(row, col, -1, 1))

            if len(flip) == 0:

                raise InvalidOthelloGameMove

            return flip
    
        else:
            raise GameBoardLocationUnEmpty

    def _flip(self, row: int, col: int, rowdelta: int, coldelta: int) -> list:
        '''Checks whether the move that a player is trying to make is valid
        but only in one direction, depending upon the values of rowdelta and
        cosdelta, that it gets'''

        row = row - 1
        col = col - 1

        opp = self._opposite_player()

        flip = []

        while True:

            row = row + rowdelta
            col = col + coldelta

            if -1 < row < self.board_row and -1 < col < self.board_row:

                if self.board[row][col].strip() == opp:
                    flip.append([row, col])
                elif self.board[row][col].strip() == self._player:
                    break
                else:
                    flip = []
                    break

            else:
                flip = []
                break

        return flip

    def winner_othello(self):
        '''Determines and returns the winner of the game depending upon
        the winning condition as desired by the user'''

        no_black_tiles = self.count_tiles()[0]
        no_white_tiles = self.count_tiles()[1]

        winner = ''

        if self._win_condition.upper() == 'MAX':
            if no_black_tiles > no_white_tiles:
                winner = 'X'
            elif no_white_tiles > no_black_tiles:
                winner = 'O'

        else:
            if no_black_tiles < no_white_tiles:
                winner = 'X'
            elif no_white_tiles < no_black_tiles:
                winner = 'O'

        return winner, no_black_tiles, no_white_tiles

    def count_tiles(self) -> list:
        '''Counts and returns the number of tiles of each player on the game
        board at a specific instant'''

        black = 0
        white = 0

        for row in range(self.board_row):
            for col in range(self.board_row):
                if self.board[row][col].strip() == 'O':
                    white += 1
                elif self.board[row][col].strip() == 'X':
                    black += 1

        return [black, white]

    def computer_count_tiles(self, tmpboard) -> list:
        '''Counts and returns the number of tiles of each player on the game
        board at a specific instant'''

        black = 0
        white = 0

        for row in range(self.board_row):
            for col in range(self.board_row):
                if tmpboard[row][col].strip() == 'O':
                    white += 1
                elif tmpboard[row][col].strip() == 'X':
                    black += 1

        return [black, white]

    def _opposite_player(self) -> str:
        '''Returns the opposite player to the input'''

        if self._player == 'O':
            return 'X'
        return 'O'


