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

    def seat_scores(self):
        seat_names = self.get_player_names()
        seat_cnt = len(self._seats)

        scores = []
        for seat_pos, seat in enumerate(self._seats):
            scores.append((seat, seat.score(seat_pos, seat_cnt, seat_names)))

        return scores

    def meta_score(self, lowest_seat_score):
        seat_names = self.get_player_names()
        seat_cnt = len(self._seats)

        total_score = 0
        for seat_pos, seat in enumerate(self._seats):
            total_score += seat.meta_score(lowest_seat_score, seat_pos, seat_cnt, seat_names)

        return total_score

    def test_seating_scores(self, test_player):
        seat_names = self.get_player_names()
        seat_cnt = len(self._seats)

        candidates = []

        for seat_pos, seat in enumerate(self._seats):
            tmp_player = seat.get_player()

            seat.replace_player(test_player)
            sim_score = seat.score(seat_pos, seat_cnt, seat_names)
            seat.unseat_player()

            if tmp_player:
                seat.seat_player(tmp_player)

            candidates.append((seat, sim_score))

        return candidates

    def get_player_names(self):
        return { s.player_name() for s in self._seats }

    def clone(self):
        return Table([s.clone() for s in self._seats])

    def record_seating(self):
        competitors = self.get_player_names()

        for pos, seat in enumerate(self._seats):
            seat_competitors = competitors.difference({seat.player_name()})
            seat.record_player(pos, seat_competitors)

    def get_unlocked_seats(self):
        return [s for s in self._seats if not s.is_locked()]

    def lock_seats(self):
        for seat in self._seats:
            seat.lock()

    def unlock_seats(self):
        for seat in self._seats:
            seat.unlock()

