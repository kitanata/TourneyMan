
class SeatingServiceConfig:

    def __init__(self, player_names):
        self.SEATS_PER_TABLE = 3
        self.PLAYERS_COUNT = len(player_names)

        self.INITIAL_POOL_SIZE = 10
        self.MAXIMUM_POOL_SIZE = 500000
        self.SCORE_DEVIATION = 1.5
        self.ITERATION_COUNT = 10

        self.SPIKE_ROUNDS = False
        self.SPIKE_COUNT = self.PLAYERS_COUNT

        self.END_EARLY_CONSISTENT = False
        self.ITERATION_CONS = 25 # higher = slower but more accurate
