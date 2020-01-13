from othello import PlayOthello

def main():
    board = int(input("Enter the board dimension:"))
    while board not in [2,4,6,8,10]:
        print("Please enter 2,4,6,8 or 10!")
        board = int(input("Enter the board dimension:"))

    first = input("Computer plays (X/O):")
    while first not in ['X','O']:
        print("Please enter X or O! X: BLACK, O: WHITE.")
        first = input("Computer plays (X/O):")

    othello = PlayOthello(board, first, 'W', 'X', 'MAX')
    othello.output_board()  # 输出初始棋盘

    while(True):
        othello.start_the_game()


if __name__ == '__main__':
    main()