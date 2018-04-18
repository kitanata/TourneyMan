import random

from seat import Seat

class Table:
    def __init__(self, seats=None):
        self._seats = seats if seats else set()

    def __str__(self):
        value = ""
        for pos, seat in enumerate(self._seats):
            value += "\tSeat #" + str(pos) + "\t|\t" + str(seat) + "\n"

        return value

    def __repr__(self):
        return str(self)

    def __len__(self):
        return len(self._seats)

    def score(self):
        seat_names = self.get_player_names()
        seat_cnt = len(self._seats)

        total_score = 0
        for seat_pos, seat in enumerate(self._seats):
            total_score += seat.score(seat_pos, seat_cnt, seat_names)

        return total_score

    def meta_score(self):
        seat_names = self.get_player_names()
        seat_cnt = len(self._seats)

        total_score = 0
        for seat_pos, seat in enumerate(self._seats):
            total_score += seat.meta_score(seat_pos, seat_cnt, seat_names)

        return total_score


    def get_best_seating_candidate(self, test_seat):
        seat_names = self.get_player_names()
        seat_cnt = len(self._seats)

        candidates = []
        best_score = 0xFFFFFFFF

        for seat_pos, seat in enumerate(self._seats):
            if seat.is_locked():
                continue

            seat.seat_player(test_seat)
            sim_score = seat.score(seat_pos, seat_cnt, seat_names)
            seat.unseat_player()

            if sim_score < best_score:
                best_score = sim_score
                candidates = []

            if sim_score <= best_score:
                candidates.append(seat)

        return candidates, best_score

    def get_player_names(self):
        return { s.player_name() for s in self._seats }

    def clone_with_locked_seats(self):
        return Table(list(map(lambda s: s.clone() if s.is_locked() else Seat(), self._seats)))

    def clone(self):
        return Table([s.clone() for s in self._seats])

    def record_seating(self):
        competitors = self.get_player_names()

        for pos, seat in enumerate(self._seats):
            seat_competitors = competitors.difference({seat.player_name()})
            seat.record_player(pos, seat_competitors)

    def has_unlocked_seats(self):
        return any([not s.is_locked() for s in self._seats])

    def get_unlocked_seats(self):
        return [s for s in self._seats if not s.is_locked()]

    def lock_seats(self):
        for seat in self._seats:
            seat.lock()

    def unlock_seats(self):
        for seat in self._seats:
            seat.unlock()

    def unlock_random_seats(self, mutation_rate):
        for s in self._seats:
            roll = random.randint(0, 100) / 100.0

            if roll > mutation_rate:
                s.unlock()

    def get_fingerprint(self):
        return sum([s.get_fingerprint() for s in self._seats]) / len(self._seats)

