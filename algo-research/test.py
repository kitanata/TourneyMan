import os
import csv
import sure
import random
from tqdm import tqdm
from math import floor

from seating_service_config import SeatingServiceConfig
from seating_service_stats import SeatingServiceStats
from seating_service import SeatingService


class SeatingSimulationTestSuite:

    def __init__(self):
        self.config = SeatingServiceConfig()
        self.num_rounds = 10

        self.should_plot = False

    def run_round_test(self, round_num=0):
        label = "Round #:" + str(round_num)
        passed = True
        reason = "NONE"

        ss_stats = SeatingServiceStats()
        service = SeatingService(self.config, ss_stats)

        rnd = service.run(round_num)
        rnd.validate()

        should_converge = rnd.should_converge(round_num, self.config)
        did_converge = ss_stats.did_converge(self.config.NUM_PLAYERS)

        if should_converge and did_converge:
            label += " - PERFECT - Converged"
            reason = "PERFECT_CONVERGENCE"
        elif not should_converge and not did_converge:
            label += " - SUCCESS"
            reason = "SUCCESSFUL_GENERATION"
        elif should_converge and not did_converge:
            label += " - FAILED - Did not converge"
            reason = "DID_NOT_CONVERGE"
            passed = False
        elif not should_converge and did_converge:
            label += " - FAILED - !!!UNEXPECTED CONVERGENCE!!!"
            reason = "UNEXPECTED_CONVERGENCE"
            passed = False
        else:
            label += " - UNDEFINED"
            reason = "UNDEFINED_BEHAVIOR"
            passed = False

        ss_stats.finish()
        ss_stats.print_exit_report()

        if self.should_plot:
            ss_stats.plot(label)

        seated_names = rnd.get_player_names()
        for name in self.config.PLAYER_NAMES:
            (seated_names).should.contain(name)

        # print(rnd)
        self.config.print_players()
        rnd.record_seating()

        return rnd, ss_stats, passed, reason


    def prompt_for_continue(self):
        option = input("Continue? (y/n)")
        return option == "y" or option == ""

    def run(self):
        results = []

        for num_players in range(1, 100):
            self.config = SeatingServiceConfig(num_players)

            for i in tqdm(range(0, self.num_rounds)):
                round_num = i + 1

                # First Round
                rnd, stats, passed, reason = self.run_round_test(round_num)

                results.append((
                    round_num, 
                    num_players, 
                    passed, 
                    reason, 
                    rnd.score(), 
                    rnd.meta_score(), 
                    len(rnd),
                    self.config.SEATS_PER_TABLE,
                    self.config.MIN_SEATS_PER_TABLE,
                    stats.total_iterations,
                    stats.time_elapsed()
                ))


        print("Writing Test Results to CSV")
        tr_filename = os.path.join(os.getcwd(), 'test_results.csv')

        with open(tr_filename, 'w', newline='') as csvfile:
            w = csv.writer(csvfile)
            w.writerow(["ROUND_NUM", "NUM_PLAYERS", "PASSED", "REASON", "SCORE", "META_SCORE", "NUM_TABLES", "MAX_SEATS", "MIN_SEATS", "NUM_ITERATIONS", "TIME_ELAPSED"])

            for item in results:
                w.writerow(item)

        print("DONE!")


if __name__ == '__main__':
    tests = SeatingSimulationTestSuite()
    tests.run()

    # import cProfile
    # cProfile.run('tests.run()', 'restats')

    # import pstats
    # thing = pstats.Stats('restats')
    # import pdb; pdb.set_trace()
    # thing.strip_dirs().sort_stats('time').print_stats(50)

    # thing2 = 5
