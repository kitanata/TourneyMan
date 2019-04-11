import os
import csv
import sure
import random
from tqdm import tqdm
from math import floor

from seating_service_config import SeatingServiceConfig
from seating_service_stats import SeatingServiceStats
from seating_service import SeatingService

class Simulation:
    def __init__(self,
        num_rounds: int = 10, 
        should_plot: bool = True, 
        num_players: int = 128
    ):
        self.config = SeatingServiceConfig()
        self.num_rounds = num_rounds
        self.should_plot = should_plot
        self.num_players = num_players

    def set_num_rounds(self, num_rounds : int = None):
        if num_rounds:
            self.num_rounds = num_rounds

    def set_should_plot(self, should_plot: bool = None):
        if should_plot:
            self.should_plot = should_plot

    def set_num_players(self, num_players: int = None):
        if num_players:
            self.num_players = num_players
            
    def run_trial(self, trial_num : int):
        results = []

        for num_players in range(6, self.num_players):
            self.config = SeatingServiceConfig(num_players)

            for i in tqdm(range(0, 8)):
                round_num = i + 1

                # First Round
                rnd, stats, did_converge = self.run_round_test(round_num)

                num_tables = len(rnd)
                num_max_tables = rnd.count_tables_of_size(self.config.SEATS_PER_TABLE)
                num_min_tables = num_tables - num_max_tables

                convergence_class = "NONE"

                if did_converge and rnd.score() == 0:
                    convergence_class = "PERFECT"
                elif did_converge:
                    convergence_class = "FAIR"

                results.append((
                    did_converge,
                    convergence_class,
                    rnd.score(),
                    rnd.meta_score(),
                    round_num, 
                    num_players, 
                    num_tables,
                    num_max_tables,
                    num_min_tables,
                    self.config.SEATS_PER_TABLE,
                    self.config.MIN_SEATS_PER_TABLE,
                ))

        print("Writing Test Results to CSV")
        tr_filename = os.path.join(os.getcwd(), 'trial_run_' + str(trial_num) + '.csv')

        with open(tr_filename, 'w', newline='') as csvfile:
            w = csv.writer(csvfile)
            w.writerow(["DID_CONVERGE", "CLASS", "SCORE", "META_SCORE", "ROUND_NUM", "NUM_PLAYERS", "NUM_TABLES", "NUM_MAX_TABLES", "NUM_MIN_TABLES", "MAX_SEATS_PER_TABLE", "MIN_SEATS_PER_TABLE"])

            for item in results:
                w.writerow(item)

    def run_round_test(self, round_num : int = 0):
        label = "Round #:" + str(round_num)

        ss_stats = SeatingServiceStats()
        service = SeatingService(self.config, ss_stats)

        rnd = service.run(round_num)
        rnd.validate()

        did_converge = ss_stats.did_converge(self.config.NUM_PLAYERS)

        ss_stats.finish()
        ss_stats.print_exit_report()

        if self.should_plot:
            ss_stats.plot(label)

        seated_names = rnd.get_player_names()
        for name in self.config.PLAYER_NAMES:
            (seated_names).should.contain(name)

        # print(rnd)
        # self.config.print_players()
        rnd.record_seating()

        return rnd, ss_stats, did_converge

    def run(self):
        for i in tqdm(range(0, self.num_rounds)):
            round_num = i + 1
            self.run_round_test(round_num)

        # for trial_num in range(0, 10):
        #     self.run_trial(trial_num)

        print("DONE!")

class SeatingSimulationTestSuite:
    
    def __init__(self,
        prompt_simulation_number: bool = False,
        prompt_simulation_config: bool = False,
        
    ):

        self.SIMULATIONS = []

        if prompt_simulation_number:
            self.SIMULATION_NUMBER = self.prompt_for_simulation_number()
        else:
            self.SIMULATION_NUMBER = 1

        if prompt_simulation_config:
            self.SIMULATIONS = [self.prompt_for_simulation_config() for i in range(0, self.SIMULATION_NUMBER)]
        else:
            self.SIMULATIONS = [Simulation() for i in range(0, self.SIMULATION_NUMBER)]
 
    def prompt_for_json_file(self):
        pass

    def prompt_for_simulation_number(self) -> int:

        number_of_simulations = input("How many simulations do you want to run? (integer >= 0)\n")

        return int(number_of_simulations)
        
    def prompt_for_simulation_config(self, simulation : Simulation = None, simulation_index: int = None) -> Simulation:

        num_rounds = int(input("Enter the number of rounds for this simulation. (default number of rounds is 10)\n"))
        should_plot = bool(input("Should this simulation be plot? (y/n)\n"))
        num_players = int(input("Enter the number of players for this simulation. (default number of players is 128)\n"))

        if simulation is None: 
            return Simulation(num_rounds, should_plot, num_players)
        else:
            simulation.set_num_rounds(num_rounds)
            simulation.set_should_plot(should_plot)
            simulation.set_num_players(num_players)

            return simulation

    def prompt_for_continue(self) -> bool:
        option = input("Continue? (y/n)")
        return option == "y" or option == ""

    def run(self):
        for simulation in self.SIMULATIONS:
            simulation.run()

if __name__ == '__main__':
    tests = SeatingSimulationTestSuite(
        prompt_simulation_number = True, 
        prompt_simulation_config = True
    )
    tests.run()

    # import cProfile
    # cProfile.run('tests.run()', 'restats')

    # import pstats
    # thing = pstats.Stats('restats')
    # import pdb; pdb.set_trace()
    # thing.strip_dirs().sort_stats('time').print_stats(50)

    # thing2 = 5
