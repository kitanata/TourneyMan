import random

from seat import Seat

class Table:
    def __init__(self, seats=None):
        self.seats = seats if seats else []

    def __str__(self):
        value = ""
        for pos, seat in enumerate(self.seats):
            value += "\tSeat #" + str(pos) + "\t|\t" + str(seat) + "\n"

        return value

    def __repr__(self):
        return str(self)

    def score(self):
        return sum(map(lambda seat: self.score_player(seat.player), self.seats))

    def score_player(self, player):
        seat_names = [seat.player.name for seat in self.seats]
        seat_pos = seat_names.index(player.name)
        seat_cnt = min(len(player.seat_hist), len(self.seats))
        seat_history = player.seat_hist[-seat_cnt:]

        sv = sum([1 if x == seat_pos else 0 for x in seat_history])
        cv = len(list(filter(lambda comp: comp in seat_names, player.comp_hist)))

        # Normalization
        sv = sv / len(self.seats) if self.seats else 0
        cv = cv / len(player.comp_hist) if player.comp_hist else 0

        sv = sv * 100
        cv = cv * 100

        return sv + cv + sv * cv + sv**2

    def get_player_names(self):
        return [s.player.name for s in self.seats]

    def clone_with_locked_seats(self):
        return Table(list(map(lambda s: s if s.locked else Seat(), self.seats)))

    def record_seating(self):
        competitors = set([seat.player.name for seat in self.seats])

        for pos, seat in enumerate(self.seats):
            seat_competitors = list(competitors - set([seat.player.name]))
            seat.player.seat_hist.append(pos)
            seat.player.comp_hist.extend(seat_competitors)

    def get_unlocked_seats(self):
        return [s for s in self.seats if not s.locked]

    def lock_seats(self):
        for seat in self.seats:
            seat.locked = True

    def unlock_seats(self):
        for seat in self.seats:
            seat.locked = False

    def unlock_random_seats(self, mutation_rate):
        for s in self.seats:
            roll = random.randint(0, 100) / 100.0

            if roll > mutation_rate:
                s.locked = False


    def seating_hash(self):
        return ''.join([s.player.name for s in self.seats])

