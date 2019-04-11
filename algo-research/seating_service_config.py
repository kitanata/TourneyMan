import random
from collections import namedtuple

from tqdm import tqdm

Player = namedtuple('Player', ['name', 'seat_hist', 'comp_hist']);

class PlayersConfig:
    def __init__(self, player_name_seeds: list=[
            "ALICE", "BOB", "CHARLIE",
            "DAVID", "ERIN", "FRANK",
            "GARY", "HEATHER", "IMOGEN",
            "JIM", "KAREN", "LINDA",
            "MANNY", "NIGEL", "OREN",
        ],
        player_names: list = [],
        num_players: int = 48,

    ):
        self.PLAYER_NAME_SEEDS = player_name_seeds
        self.PLAYER_NAMES = player_names
        self.NUM_PLAYERS = num_players

        for i in range(0, self.NUM_PLAYERS):
            self.PLAYER_NAMES.append(str(i) + '_' + random.choice(self.PLAYER_NAME_SEEDS))

        self.PLAYERS = [Player(name, [], []) for name in self.PLAYER_NAMES]
        
    def __str__(self):
        for p in self.PLAYERS:
            print(p.name + "\t SEATS: " + str(p.seat_hist))
            print(p.name + "\t COMPETITORS: " + str(p.comp_hist))

    def __repr__(self):
        return str(self)

class SeatingServiceConfig:
    def __init__(self, 
        num_players: int = 48, 
        seats_per_table: int = 4, 
        min_seats_per_table: int = 3, 
        max_iterations: int = 1000, 
        end_early_consistent: bool = True, 
        iteration_cons: int = 100,
        clash_mutation_size: int = 25,
        debug: bool = True
    ):

        self.DEBUG = debug

        self.NUM_PLAYERS = num_players
        self.SEATS_PER_TABLE = seats_per_table
        self.MIN_SEATS_PER_TABLE = min_seats_per_table

        self.MAX_ITERATIONS = max_iterations

        self.END_EARLY_CONSISTENT = end_early_consistent
        self.ITERATION_CONS = iteration_cons

        self.CLASH_MUTATION_SIZE = clash_mutation_size

        self.PLAYERS_CONFIG = PlayersConfig()
        self.PLAYERS = self.PLAYERS_CONFIG.PLAYERS
        self.PLAYER_NAME_SEEDS = self.PLAYERS_CONFIG.PLAYER_NAME_SEEDS
        self.PLAYER_NAMES = self.PLAYERS_CONFIG.PLAYER_NAMES

    def print_players(self):
        if self.DEBUG:
            print(self.PLAYERS)

    def log(self, message):
        if not self.DEBUG:
            return False

        print(message)

    def progress(self, iterable):
        if not self.DEBUG:
            return iterable

        return tqdm(iterable)

