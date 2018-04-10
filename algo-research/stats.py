import statistics
import matplotlib.pyplot as plt

class Stats:
    def __init__(self):
        self.rounds = []
        self.iterations = []

    def finish_round(self):
        self.rounds.append(self.iterations)
        self.iterations = []

    def record_iteration(self, rounds):
        scores = [r.score() for r in rounds]
        mean = statistics.mean(scores)
        pstdev = statistics.pstdev(scores)

        std_scores = []
        if pstdev:
            std_scores = [(s - mean) / pstdev for s in scores]

        self.iterations.append({
            "scores": scores,
            "std_scores": std_scores,
            "stats": {
                "best_score": min(scores),
                "worst_score": max(scores),
                "mean": mean,
                "median": statistics.median(scores),
                "pvar": statistics.pvariance(scores),
                "psd": pstdev,
            }
        })

    def get_iteration_stats(self, round):
        return [iter["stats"] for iter in round]

    def plot(self):
        recent_round = self.rounds[-1]
        iter_stats = self.get_iteration_stats(recent_round)
        best_scores = [iter["best_score"] for iter in iter_stats]
        worst_scores = [iter["worst_score"] for iter in iter_stats]

        # Data for plotting
        t = range(0, len(iter_stats))

        # Note that using plt.subplots below is equivalent to using
        # fig = plt.figure() and then ax = fig.add_subplot(111)
        fig, ax = plt.subplots()
        ax.plot(t, best_scores)
        ax.plot(t, worst_scores)

        ax.set(xlabel='iteration', ylabel='Scores',
                      title='Score Over Time')
        ax.grid()

        plt.show()
        
        #import pdb; pdb.set_trace()
        thing = 5
