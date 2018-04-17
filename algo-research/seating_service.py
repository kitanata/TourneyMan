import statistics

from tqdm import tqdm
from math import floor

from round import Round

class SeatingService:

    def __init__(self, players, config, stats):
        self.players = players
        self.config = config
        self.stats = stats

    def generate_random_round_pool(self, pool_size):
        pool = []

        for i in tqdm(range(0, self.config.INITIAL_POOL_SIZE)):
            new_round = Round(players=self.players)
            new_round.pair_players(list(self.players), self.config.SEATS_PER_TABLE)
            pool.append(new_round)

        return pool

    def remove_duplicate_rounds(self, round_pool, iter_stats):
        iter_stats.initial_pool_size = len(round_pool)

        dedup = {r.get_fingerprint(): r for r in tqdm(round_pool)}
        new_round_pool = dedup.values()

        iter_stats.num_duplicates = iter_stats.initial_pool_size - len(new_round_pool)
        iter_stats.pct_duplicates = iter_stats.num_duplicates / iter_stats.initial_pool_size

        return new_round_pool

    def cull_round_pool(self, round_pool, iter_stats):
        sorted_rounds = sorted(round_pool, key=lambda x: x.score())
        scores = [r.score() for r in sorted_rounds]

        self.stats.record_best_round(sorted_rounds[0])

        iter_stats.cull_pstd_deviation = round(statistics.pstdev(scores), 5)
        iter_stats.cull_score_threshold = iter_stats.best_score + \
            iter_stats.cull_pstd_deviation * self.config.SCORE_DEVIATION

        top_rounds = [r for r in sorted_rounds if r.score() <= iter_stats.cull_score_threshold]

        iter_stats.top_rounds_len = len(top_rounds)
        iter_stats.top_rounds_clamp_len = min(iter_stats.top_rounds_len, self.config.MAXIMUM_POOL_SIZE)

        new_round_pool = top_rounds[:iter_stats.top_rounds_clamp_len]
        iter_stats.culled_pool_size = len(new_round_pool)

        return new_round_pool

    def check_global_minimum(self, round_pool, iter_stats):
        if iter_stats.best_score == 0:
            self.stats.record_iteration(round_pool)
            return True, iter_stats.best_round

        return False, None

    def spike_round_pool(self, iter_stats):
        random_generation_count = self.config.SPIKE_COUNT

        # check for local optimum
        if iter_stats.culled_pool_size == 1:
            # widen the search space
            random_generation_count = self.config.INITIAL_POOL_SIZE
            self.stats.total_best_score = self.stats.total_best_score * 10

        # spike the new round pool with random rounds
        iter_stats.spike_count = random_generation_count
        return self.generate_random_round_pool(random_generation_count)

        # spike the new round pool with a random sample of poor generations
        # bottom_rounds = sorted_rounds[clamp_len:]
        # sample_count = min(len(bottom_rounds), MAXIMUM_POOL_SIZE)
        # bottom_rounds = random.sample(bottom_rounds, sample_count)
        # new_round_pool.extend(bottom_rounds)

    def check_early_exit(self):
        # check if last X iterations are the same, if so end early
        if not self.config.END_EARLY_CONSISTENT:
            return False, None
        
        if len(self.stats.best_rounds) < self.config.ITERATION_CONS:
            return False, None

        last_score = self.stats.best_rounds[-1].score()
        scores = [r.score() for r in self.stats.best_rounds[-self.config.ITERATION_CONS:]]

        if round(sum(scores) / self.config.ITERATION_CONS, 5) == last_score:
            return True, best_round

        return False,None

    def generate_mutations(self, round_pool, iter_stats):
        # for each round
        new_round_pool = []

        # The bigger the current pool, the less mutations per item in the pool we should need
        # The more players we have the more mutations we should need (scaled per 100)
        # The more iterations we have done, the bigger the search space we should look in
        #   bounded by the scope of the last iteration
        iter_stats.mutation_count = floor((1 / iter_stats.final_pool_size) * 10000 * (iter_stats.iteration_num) * (self.config.PLAYERS_COUNT / 100))

        for j, rnd in enumerate(tqdm(round_pool)):
            new_rounds = rnd.generate_mutations(iter_stats.mutation_count)
            new_round_pool.extend(new_rounds)

        return new_round_pool

    def run(self):
        # initialize round pool
        print("Generating Initial Pool")
        round_pool = self.generate_random_round_pool(self.config.INITIAL_POOL_SIZE)

        # iterate some number of times
        for i in range(0, self.config.ITERATION_COUNT):
            iter_stats = self.stats.create_iteration()

            # Remove duplicate rounds
            print("Removing duplicate rounds.")
            round_pool = self.remove_duplicate_rounds(round_pool, iter_stats)

            # Record what was searched
            print("Scoring and recording searched.")
            self.stats.record_searched(round_pool)

            # get the top best of them
            print("Culling the round pool.")
            round_pool = self.cull_round_pool(round_pool, iter_stats)

            # if any are 0, then done.
            print("Checking for Global Minimum.")
            should_exit, best_round = self.check_global_minimum(round_pool, iter_stats)
            if should_exit:
                self.stats.print_exit_report()
                return best_round

            if self.config.SPIKE_ROUNDS:
                print("Spiking round pool.")
                round_pool.extend(self.spike_round_pool(iter_stats))

            iter_stats.final_pool_size = len(round_pool)

            self.stats.record_iteration(round_pool) 

            print("Checking for early exit.")
            should_exit_early, best_round = self.check_early_exit()

            if should_exit_early:
                self.stats.print_exit_report()
                return best_round

            print("Generating Mutations")
            new_round_pool = self.generate_mutations(round_pool, iter_stats)

            iter_stats.print_iteration_report()

            # add the kept rounds back into the pool
            round_pool.extend(new_round_pool)

        best_rounds = sorted(self.stats.best_rounds, key=lambda x: x.score())
        best_round = best_rounds[0]
        best_round.validate()

        self.stats.print_exit_report()
        return best_round

