
class Seat:
    def __init__(self, player=None, locked=False):
        self.player = player
        self.locked = locked

    def __str__(self):
        name = self.player.name if self.player else "None"
        return name + "\t|\t" + str(self.locked)

    def __repr__(self):
        name = self.player.name if self.player else "None"
        return "<Seat player.name=" + name + " locked=" + str(self.locked) + ">"
