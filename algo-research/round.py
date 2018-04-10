import random
from math import floor

from seat import Seat
from table import Table

class Round:
    def __init__(self, players=None, tables=None):
        self.players = players if players else []
        self.tables = tables if tables else []
        self.mutation_threshold_pct = 0.5
        self.seat_mutation_rate = 0.3
        self.last_score = 0

    def __str__(self):
        value = ""
        for num, table in enumerate(self.tables):
            value += "TABLE #" + str(num) + "\n"
            value += str(table) + "\n"

        return value

    def __repr__(self):
        return str(self)

    def __len__(self):
        return len(self.tables)

    def validate(self):
        player_names = [p.name for p in self.players]
        names = self.get_player_names()

        if len(set(names)) != len(player_names):
            raise Exception("Round Validation Failed");

    def score(self):
        self.last_score = round(sum(map(lambda t: t.score(), self.tables)), 5)
        return self.last_score

    def record_seating(self):
        [t.record_seating() for t in self.tables]

    def get_unlocked_seats(self):
        unlocked_seats = [t.get_unlocked_seats() for t in self.tables]
        return sum(unlocked_seats, [])

    def unlock_seats(self):
        [t.unlock_seats() for t in self.tables]

    def shuffle_seats(self):
        cloned_tables = [t.clone_with_locked_seats() for t in self.tables]
        new_round = Round(players=self.players, tables=cloned_tables)

        unlocked_seats = self.get_unlocked_seats()
        random.shuffle(unlocked_seats)

        new_unlocked_seats = new_round.get_unlocked_seats()
        random.shuffle(new_unlocked_seats)

        while unlocked_seats:
            old_seat = unlocked_seats.pop()
            new_seat = new_unlocked_seats.pop()

            new_seat.player = old_seat.player
            new_seat.locked = True

        new_round.unlock_seats()

        return new_round

    def get_player_names(self):
        names = [t.get_player_names() for t in self.tables]
        return sum(names, [])

    def pair_players(self, players):
        self.tables = [];

        while players:
            choices = random.sample(players, 3)
            players = [p for p in players if p not in choices]
            new_table = Table([Seat(p) for p in choices])
            self.tables.append(new_table)

    def generate_mutations(self):
        table_scores = [t.score() for t in self.tables]

        best = max(table_scores)
        worst = min(table_scores)

        thresh = floor(worst + ((best - worst) * self.mutation_threshold_pct))

        for table in self.tables:
            if table.score() > thresh:
                table.lock_seats()
                table.unlock_random_seats(self.seat_mutation_rate)

        mutated_rounds = []
        unlocked_seats = self.get_unlocked_seats()
        mutation_count = len(unlocked_seats) * 10
        for i in range(0, mutation_count):
            # shuffle players between all unlocked seats
            new_round = self.shuffle_seats()
            new_round.validate()
            mutated_rounds.append(new_round)

        return mutated_rounds

    def seating_hash(self):
        return ''.join([t.seating_hash() for t in self.tables])

