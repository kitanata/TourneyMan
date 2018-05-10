import random
from collections import namedtuple

from tqdm import tqdm

Player = namedtuple('Player', ['name', 'seat_hist', 'comp_hist']);

class SeatingServiceConfig:

    def __init__(self, num_players=None):
        self.DEBUG = True

        self.NUM_PLAYERS = num_players if num_players else 48 
        self.SEATS_PER_TABLE = 4
        self.MIN_SEATS_PER_TABLE = 3

        self.MAX_ITERATIONS = 1000

        self.END_EARLY_CONSISTENT = True
        self.ITERATION_CONS = 100 

        self.CLASH_MUTATION_SIZE = 25 

        PLAYER_NAME_SEEDS = [
            "ALICE", "BOB", "CHARLIE",
            "DAVID", "ERIN", "FRANK",
            "GARY", "HEATHER", "IMOGEN",
            "JIM", "KAREN", "LINDA",
            "MANNY", "NIGEL", "OREN",
        ]

        self.PLAYER_NAMES = []
        for i in range(0, self.NUM_PLAYERS):
            self.PLAYER_NAMES.append(str(i) + '_' + random.choice(PLAYER_NAME_SEEDS))

        self.PLAYERS = [Player(name, [], []) for name in self.PLAYER_NAMES]

    def print_players(self):
        if not self.DEBUG:
            return

        for p in self.PLAYERS:
            print(p.name + "\t SEATS: " + str(p.seat_hist))
            print(p.name + "\t COMPETITORS: " + str(p.comp_hist))


    def log(self, message):
        if not self.DEBUG:
            return False

        print(message)

    def progress(self, iterable):
        if not self.DEBUG:
            return iterable

        return tqdm(iterable)

