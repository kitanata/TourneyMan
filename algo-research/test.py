import sure
import random
from collections import namedtuple
from math import floor

from round import Round
from stats import Stats

Player = namedtuple('Player', ['name', 'seat_hist', 'comp_hist']);

PLAYER_NAMES = [
    "ALICE", "BOB", "CHARLIE",
    "DAVID", "ERIN", "FRANK",
    "GARY", "HEATHER", "IMOGEN",
]

PLAYERS = [Player(name, [], []) for name in PLAYER_NAMES]

stats = Stats()

def seating_algorithm():
    SEATS_PER_TABLE = 3
    PLAYERS_COUNT = len(PLAYER_NAMES)

    INITIAL_POOL_SIZE = PLAYERS_COUNT
    MAXIMUM_POOL_SIZE = SEATS_PER_TABLE * PLAYERS_COUNT
    ITERATION_COUNT = 250 
    ITERATION_CONS = 10

    round_pool = []
    best_rounds = []

    # initialize round pool
    for i in range(0, INITIAL_POOL_SIZE):
        new_round = Round(players=PLAYERS)
        new_round.pair_players(list(PLAYERS))
        round_pool.append(new_round)

    # iterate some number of times
    for i in range(0, ITERATION_COUNT):
        # Remove any duplicates
        dup_dict = {}
        for rnd in round_pool:
            dup_dict[rnd.seating_hash()] = rnd

        round_pool = list(dup_dict.values())

        print("\r Iteration: " 
              + str(i) 
              + " Pool Size: " 
              + str(len(round_pool)))

        # get the top best of them
        best_half_len = min(floor(len(round_pool) / 2), MAXIMUM_POOL_SIZE)
        top_rounds = sorted(round_pool, key=lambda x: x.score())
        top_rounds = top_rounds[:best_half_len]

        bottom_rounds = top_rounds[best_half_len:]
        sample_count = min(len(bottom_rounds), MAXIMUM_POOL_SIZE)
        bottom_rounds = random.sample(bottom_rounds, sample_count)
        bottom_rounds = sorted(bottom_rounds, key=lambda x: x.score())

        top_rounds = top_rounds + bottom_rounds
        stats.record_iteration(top_rounds)

        # if any are 0, then done.
        best_round = top_rounds[0]
        if best_round.score() == 0:
            return best_round
        else: 
            best_rounds.append(best_round)


        # check if last 10 iterations are the same, if so end early
        if len(best_rounds) > ITERATION_CONS:
            last_score = best_rounds[-1].score()
            scores = [r.score() for r in best_rounds[-ITERATION_CONS:]]

            if round(sum(scores) / ITERATION_CONS, 5) == last_score:
                return best_round


        # for each round
        round_pool = []
        for j, rnd in enumerate(top_rounds):
            new_rounds = rnd.generate_mutations()
            round_pool.extend(new_rounds)

        round_pool.extend(top_rounds)

    best_rounds = sorted(best_rounds, key=lambda x: x.score())
    best_round = best_rounds[0]
    best_round.validate()
    return best_round




def run_round_test():
    rnd = seating_algorithm()
    stats.finish_round()
    stats.plot()

    # (round.score()).should.eql(0)
    (len(rnd)).should.eql(3)

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


