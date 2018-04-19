import time
import statistics
import matplotlib.pyplot as plt

class SeatingIterationStats:
    
    def __init__(self, iter_num):
        self.iteration_num = iter_num

        self.round = None
        self.score = 0xFFFFFFFF
        self.meta_score = 0
        self.start_time = time.perf_counter()
        self.finish_time = self.start_time

    def finish(self):
        self.finish_time = time.perf_counter()

    def time_elapsed(self):
        return round(self.finish_time - self.start_time, 5)

    def print_iteration_report(self):
        print("")
        print("Iteration: #" + str(self.iteration_num))
        print("\t Score: " + str(self.score))
        print("\t # Seats Correct: " + str(self.meta_score))
        print("\t Time Elapsed: " + str(self.time_elapsed()))



class SeatingServiceStats:

    def __init__(self):
        self.best_score = 0xFFFFFFFF
        self.total_iterations = 0

        self.iteration_stats = []
        self.current_iteration_stats = None

        self.start_time = time.perf_counter()
        self.finish_time = time.perf_counter()

    def create_iteration(self):
        self.total_iterations += 1

        self.current_iteration_stats = SeatingIterationStats(self.total_iterations)
        self.iteration_stats.append(self.current_iteration_stats)

        return self.current_iteration_stats

    def finish_iteration(self):
        self.current_iteration_stats.finish()

    def finish(self):
        self.finish_time = time.perf_counter()

    def time_elapsed(self):
        return round(self.finish_time - self.start_time, 5)

    def get_rounds(self):
        return [iter.round for iter in self.iteration_stats]

    def record_round(self, cur_round):
        self.current_iteration_stats.round = cur_round
        self.current_iteration_stats.score = cur_round.score()
        self.current_iteration_stats.meta_score = cur_round.meta_score()

        if self.current_iteration_stats.score < self.best_score:
            self.best_score = self.current_iteration_stats.score


    def did_converge(self, num_players):
        return self.current_iteration_stats.meta_score == num_players

    def print_exit_report(self):
        print(" # of Iterations: " + str(self.total_iterations) 
              + " Best Score: " + str(self.best_score)
              + " Time Elapsed (s): " + str(self.time_elapsed()))

    def plot(self, title):
        iter_stats = self.iteration_stats
        scores = [iter.score for iter in iter_stats]
        meta_scores = [iter.meta_score for iter in iter_stats]
        time_elapsed = [iter.time_elapsed() * 100 for iter in iter_stats]

        # Data for plotting
        t = range(0, len(iter_stats))

        # Note that using plt.subplots below is equivalent to using
        # fig = plt.figure() and then ax = fig.add_subplot(111)
        fig, ax = plt.subplots()

        ax.scatter(t, scores, alpha=0.5)
        ax.scatter(t, meta_scores, alpha=0.5)
        ax.scatter(t, time_elapsed, alpha=0.5)

        line_best, = ax.plot(t, scores, label="Fitness")
        line_meta, = ax.plot(t, meta_scores, label="# Perfect Seats")
        line_iter_time, = ax.plot(t, time_elapsed, label="Time Elapsed (s) * 100")

        plt.legend(handles=[line_best, line_meta, line_iter_time])

        ax.set(xlabel='Iteration', ylabel='Seating Fitness', title=title)
        ax.grid()

        plt.show()
