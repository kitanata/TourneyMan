import statistics
import random

from math import floor

from round import Round

class SeatingService:

    def __init__(self, config, stats):
        self.config = config
        self.stats = stats

    def check_early_exit(self):
        # check if last X iterations are the same, if so end early
        if not self.config.END_EARLY_CONSISTENT:
            return False

        rounds = self.stats.get_rounds()
        
        if len(rounds) < self.config.ITERATION_CONS:
            return False

        last_score = rounds[-1].score()
        scores = [r.score() for r in rounds[-self.config.ITERATION_CONS:]]

        if round(sum(scores) / self.config.ITERATION_CONS, 5) == last_score:
            return True

        return False

    def run(self, round_num):
        # initialize round pool
        self.config.log("Generating Initial Seating Arrangement")

        cur_round = Round(players=self.config.PLAYERS)
        cur_round.pair_players(
            list(self.config.PLAYERS), 
            self.config.SEATS_PER_TABLE,
            self.config.MIN_SEATS_PER_TABLE)

        should_converge = cur_round.should_converge(round_num, self.config)

        # iterate some number of times
        for i in range(0, self.config.MAX_ITERATIONS):
            iter_stats = self.stats.create_iteration()

            self.stats.record_round(cur_round)

            # if any are 0, then done.
            self.config.log("Checking for Global Minimum.")
            if self.stats.did_converge(self.config.NUM_PLAYERS):
                return cur_round

            self.config.log("Checking for early exit.")
            if not should_converge and self.check_early_exit():
               return cur_round

            self.config.log("Improving Seating Assignments")
            new_round = cur_round.improve(self.config)

            if new_round.score() <= cur_round.score():
                cur_round = new_round
            # else:
            #     pool = [cur_round.improve(self.config) for i in range(0, self.config.CLASH_MUTATION_SIZE)]
            #     pool.sort(key=lambda x: x.score())

            #     best_round = pool[0]
            #     
            #     if best_round.score() < cur_round.score():
            #         cur_round = best_round

            self.stats.finish_iteration()

            if self.config.DEBUG:
                iter_stats.print_iteration_report()

        cur_round.validate()

        return cur_round

