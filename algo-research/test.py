import sure
import random
from tqdm import tqdm
from collections import namedtuple
from math import floor

from seating_service_config import SeatingServiceConfig
from seating_service_stats import SeatingServiceStats
from seating_service import SeatingService

Player = namedtuple('Player', ['name', 'seat_hist', 'comp_hist']);

PLAYER_NAMES_SEEDS = [
    "ALICE", "BOB", "CHARLIE",
    "DAVID", "ERIN", "FRANK",
    "GARY", "HEATHER", "IMOGEN",
    "JIM", "KAREN", "LINDA",
    "MANNY", "NIGEL", "OREN",
]

PLAYER_NAMES = [str(i) + '_' + random.choice(PLAYER_NAMES_SEEDS) for i in range(0, 30)]

PLAYERS = [Player(name, [], []) for name in PLAYER_NAMES]

def run_round_test():
    ss_config = SeatingServiceConfig(PLAYER_NAMES)
    ss_stats = SeatingServiceStats()
    service = SeatingService(PLAYERS, ss_config, ss_stats)

    rnd = service.run()

    ss_stats.stats.finish_round()
    ss_stats.stats.plot()

    # (round.score()).should.eql(0)
    # (len(rnd)).should.eql(3)

    rnd.validate()
    seated_names = rnd.get_player_names()

    for name in PLAYER_NAMES:
        (seated_names).should.contain(name)

    return rnd


def print_players():
    for p in PLAYERS:
        print(p.name + "\t SEATS: " + str(p.seat_hist))
        print(p.name + "\t COMPETITORS: " + str(p.comp_hist))


def prompt_for_continue():
    option = input("Continue? (y/n)")
    return option == "y" or option == ""


def run_tests():
    for i in range(0, 10):
        # First Round
        rnd = run_round_test()

        # Record Seating
        print("ROUND " + str(i) + " SEATING")
        print(rnd)
        rnd.record_seating()
        print("ROUND " + str(i) + "  RECORD")
        print_players()

        if not prompt_for_continue():
            break

        print("")
        print("")
        print("")
        print("")
        print("")

    print("SUCCESS!")


if __name__ == '__main__':
    run_tests()
