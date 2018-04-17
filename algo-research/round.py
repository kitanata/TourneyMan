import random
from math import floor

from seat import Seat
from table import Table

class Round:
    def __init__(self, players=None, tables=None):
        self._tables = tables if tables else []

        self.players = players if players else []
        self.mutation_threshold_pct = 0.80
        self.seat_mutation_rate = 0.20
        self.max_mutation_count = 25
        self.min_mutation_count = 10

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

    def clone_locked(self):
        cloned_tables = [t.clone_with_locked_seats() for t in self._tables]
        return Round(players=self.players, tables=cloned_tables)

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
        table_scores = [t.score() for t in self._tables]

        best = max(table_scores)
        worst = min(table_scores)

        thresh = floor(worst + ((best - worst) * self.mutation_threshold_pct))

        for table in self._tables:
            if table.score() <= thresh:
                table.lock_seats()
                table.unlock_random_seats(self.seat_mutation_rate)

        mutated_rounds = []
        all_unlocked_seats = self.get_unlocked_seats()
        random.shuffle(all_unlocked_seats)

        # mutation_count = len(all_unlocked_seats)# * 10
        # mutation_count = min(mutation_count, self.max_mutation_count)
        # mutation_count = max(mutation_count, self.min_mutation_count)

        # memoize the round with locked seats
        proto_round = self.clone_locked()

        for i in range(0, mutation_count):
            # shuffle players between all unlocked seats
            new_round = proto_round.clone()

            new_unlocked_seats = new_round.get_unlocked_seats()
            random.shuffle(new_unlocked_seats)

            old_unlocked_seats = list(all_unlocked_seats)
            while old_unlocked_seats:
                old_seat = old_unlocked_seats.pop()
                new_seat = new_unlocked_seats.pop()

                new_seat.seat_player(old_seat)

            new_round.unlock_seats()
            new_round.validate()
            mutated_rounds.append(new_round)

        return mutated_rounds

    def get_fingerprint(self):
        return sum([t.get_fingerprint() for t in self._tables]) / len(self._tables)
