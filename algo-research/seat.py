
SWT1 = 0.2
SWT2 = 0.5

CWT1 = 0.2
CWT2 = 0.5

class Seat:
    def __init__(self, player=None, locked=False):
        self._player = player
        self._locked = locked

        self._dirty = True
        self._memo_score = None

    def __str__(self):
        name = self._player.name if self._player else "None"
        return name + "\t|\t" + str(self._locked)

    def __repr__(self):
        name = self._player.name if self._player else "None"
        return "<Seat player.name=" + name + " locked=" + str(self._locked) + ">"

    def clone(self):
        return Seat(player=self._player, locked=self._locked)

    def lock(self):
        self._locked = True
        self._dirty = True

    def unlock(self):
        self._locked = False
        self._dirty = True

    def is_locked(self):
        return self._locked == True # Do not give write access to _locked

    def record_player(self, seat_pos, competitors):
        self._player.seat_hist.append(seat_pos)
        self._player.comp_hist.extend(competitors)

    def player_name(self):
        return self._player.name

    def player_seat_history(self):
        return self._player.seat_hist

    def player_competitor_history(self):
        return self._player.comp_hist

    def seat_player(self, old_seat):
        if self.is_locked():
            raise Exception("Seat is locked, and cannot be mutated.")

        self._player = old_seat._player
        self._locked = True
        self._dirty = True

    def score(self, seat_pos, seat_cnt, seat_names):
        if self._dirty:
            self._memo_score = self._score(seat_pos, seat_cnt, seat_names)
            self._dirty = False

        return self._memo_score

    def _score(self, seat_pos, seat_cnt, seat_names):
        sv = self._seat_history_comp_score(seat_pos, seat_cnt)
        cv = self._competitor_history_comp_score(seat_names)

        svt = SWT1 * sv**2 + SWT2 * sv + sv
        cvt = CWT1 * cv**2 + CWT2 * cv + cv

        return svt + cvt + svt * cvt + svt**2 + cvt**2

    def _seat_history_comp_score(self, seat_pos, seat_cnt):
        player_seat_history = self.player_seat_history()
        seat_cnt = min(len(player_seat_history), seat_cnt - 1)
        seat_history = player_seat_history[-seat_cnt:]

        sv = len([x for x in seat_history if x == seat_pos])

        return sv / seat_cnt if seat_cnt else 0

    def _competitor_history_comp_score(self, seat_names):
        player_competitor_history = self.player_competitor_history()

        cv = len([comp for comp in player_competitor_history if comp in seat_names])
        return cv / len(player_competitor_history) if player_competitor_history else 0

    def get_fingerprint(self):
        return hash(self.player_name)

