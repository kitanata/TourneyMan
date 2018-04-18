import random
from math import floor

from seat import Seat
from table import Table

class Round:
    def __init__(self, players=None, tables=None):
        self._tables = tables if tables else []
        self.players = players if players else []

        self.memo_score = None

    def __str__(self):
        value = ""
        for num, table in enumerate(self._tables):
            value += "TABLE #" + str(num) + "\n"
            value += str(table) + "\n"

        return value

    def __repr__(self):
        return str(self)

    def __len__(self):
        return len(self._tables)

    def clone(self):
        return Round(players=self.players, tables=[t.clone() for t in self._tables])

    def validate(self):
        player_names = [p.name for p in self.players]
        names = self.get_player_names()

        if len(set(names)) != len(player_names):
            raise Exception("Round Validation Failed");

    def score(self, rescore=False):
        if rescore or not self.memo_score:
            self.memo_score = round(sum(map(lambda t: t.score(), self._tables)), 5)
        return self.memo_score

    def meta_score(self):
        seat_scores = sum([t.seat_scores() for t in self._tables], [])
        lowest_seat_score = min([s[1] for s in seat_scores])

        return sum([t.meta_score(lowest_seat_score) for t in self._tables])

    def record_seating(self):
        [t.record_seating() for t in self._tables]

    def get_unlocked_seats(self):
        unlocked_seats = [t.get_unlocked_seats() for t in self._tables]
        return sum(unlocked_seats, [])

    def unlock_seats(self):
        [t.unlock_seats() for t in self._tables]

    def get_player_names(self):
        all_names = set()

        for t in self._tables:
            all_names.update(t.get_player_names())

        return all_names

    def pair_players(self, players, table_size):
        self._tables = set();

        random.shuffle(players)

        p_sets = zip(*[iter(players)]*table_size)

        for choices in p_sets:
            new_table = Table([Seat(p) for p in choices])
            self._tables.add(new_table)

    def generate_mutations(self, mutation_count):
        mutated_rounds = []

        SEAT = 0
        SCORE = 1

        for i in range(0, mutation_count):

            new_round = self.clone()

            seat_scores = sum([t.seat_scores() for t in new_round._tables], [])
            lowest_score = min([ss[SCORE] for ss in seat_scores])
            bad_seats = [ss for ss in seat_scores if ss[SCORE] > lowest_score]

            swapped_players = []

            for bad in bad_seats:
                best_score = 0xFFFFFF
                better_seats = []

                # Find a better seat for this player
                for t in new_round._tables:
                    test_results = t.test_seating_scores(bad[SEAT].get_player())

                    for res in test_results:
                        if res[SCORE] < bad[SCORE]:
                            better_seats.append(res[SEAT])


                if better_seats:
                    # Choose randomly a better seat
                    new_seat = random.choice(better_seats)
                    occupied_player = new_seat.get_player()

                    if occupied_player:
                        swapped_players.append(occupied_player)
                        new_seat.unseat_player()

                    new_seat.seat_player(bad[SEAT].get_player())
                else:
                    swapped_players.append(bad[SEAT].get_player())

                bad[SEAT].unseat_player()

            # shuffle players between all unlocked seats
            new_unlocked_seats = new_round.get_unlocked_seats()
            random.shuffle(new_unlocked_seats)

            # Randomly seat the swapped out players
            while swapped_players:
                player = swapped_players.pop()
                new_seat = new_unlocked_seats.pop()
                new_seat.seat_player(player)

            new_round.unlock_seats()
            new_round.validate()
            mutated_rounds.append(new_round)

        return mutated_rounds

    def get_fingerprint(self):
        return sum([t.get_fingerprint() for t in self._tables]) / len(self._tables)

