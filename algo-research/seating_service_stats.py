from tqdm import tqdm

from stats import Stats

class SeatingIterationStats:
    
    def __init__(self, iter_num):
        self.iteration_num = iter_num

        self.initial_pool_size = 0
        self.num_duplicates = 0
        self.pct_duplicates = 0

        self.best_round = None
        self.best_score = 0xFFFFFFFF
        self.cull_pstd_deviation = 0
        self.cull_score_threshold = 0

        self.top_rounds_clamp_len = 0
        self.top_rounds_len = 0
        self.culled_pool_size = 0

        self.spike_count = 0

        self.final_pool_size = 0

        self.mutation_count = 0

    def print_iteration_report(self):
        total_culled = self.initial_pool_size - self.culled_pool_size
        pct_culled = round((total_culled / self.initial_pool_size) * 100, 2)

        print("Iteration: #" + str(self.iteration_num))
        print("\t Pool Sizes:")
        print("\t\t Initial Pool Size: " + str(self.initial_pool_size))
        print("\t\t Culled Pool Size: " + str(self.culled_pool_size))
        print("\t\t Final Pool Size: " + str(self.final_pool_size))
        print("\t Duplicates:")
        print("\t\t # Duplicated: " + str(self.num_duplicates))
        print("\t\t % Duplicated: " + str(round(self.pct_duplicates * 100, 2)))
        print("\t Culling:")
        print("\t\t Best Score: " + str(self.best_score))
        print("\t\t Score pSTD Deviation: " + str(self.cull_pstd_deviation))
        print("\t\t Cull Score Threshold: " + str(self.cull_score_threshold))
        print("\t\t Top Rounds Clamp Length: " + str(self.top_rounds_clamp_len))
        print("\t\t Top Rounds Length: " + str(self.top_rounds_len))
        print("\t\t # Total Culled : " + str(self.initial_pool_size - self.culled_pool_size))
        print("\t\t % Culled : " + str(pct_culled))
        print("\t Mutations :")
        print("\t\t # Mutations Per: " + str(self.mutation_count))
        print("\t Random Spiking :")
        print("\t\t # Spikes Added: " + str(self.spike_count))


class SeatingServiceStats:

    def __init__(self):
        self.stats = Stats()

        self.SEARCHED_ROUNDS = {}
        self.SEARCHED_COUNT = {}

        self.total_best_score = 0xFFFFFFFF
        self.total_iterations = 0

        self.best_rounds = []

        self.iteration_stats = []
        self.current_iteration_stats = None

    def create_iteration(self):
        self.total_iterations += 1

        self.current_iteration_stats = SeatingIterationStats(self.total_iterations)
        self.iteration_stats.append(self.current_iteration_stats)

        return self.current_iteration_stats

    def record_searched(self, round_pool):
        for r in tqdm(round_pool):
            fp = r.get_fingerprint()
            self.SEARCHED_ROUNDS[fp] = r.score()
            self.SEARCHED_COUNT[fp] = self.SEARCHED_COUNT.get(fp, 0) + 1

    def record_best_round(self, best_round):
        self.current_iteration_stats.best_round = best_round
        self.current_iteration_stats.best_score = best_round.score()
        self.best_rounds.append(best_round)

        if self.current_iteration_stats.best_score < self.total_best_score:
            self.total_best_score = self.current_iteration_stats.best_score

    def record_iteration(self, round_pool):
        self.stats.record_iteration(round_pool)

    def print_exit_report(self):
        import pdb; pdb.set_trace()
        print("# Rounds Searched: " 
            + str(len(self.SEARCHED_ROUNDS))
            + " # of Iterations: "
            + str(self.total_iterations)
            + " Best Score: "
            + str(self.total_best_score))
