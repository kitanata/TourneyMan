import csv

import numpy as np
from sklearn.linear_model import LinearRegression

from mpl_toolkits.mplot3d import Axes3D
import matplotlib.pyplot as plt
from matplotlib import cm
from matplotlib.ticker import LinearLocator, FormatStrFormatter

def read_file():
    results = []

    with open('round_player_averages.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            data = {k: float(v) for k, v in dict(row).items()}
            results.append(data)

    return results


def get_prediction_data(fieldname, items):
    data = []

    for item in items:
        round_num = item['ROUND_NUM']
        num_players = item['NUM_PLAYERS']
        r2 = round_num ** 2
        p2 = num_players ** 2

        field = item[fieldname]

        data.append((
            round_num,
            num_players,
            round_num * num_players,
            r2,
            p2,
            r2 * p2,
            field))

    data = np.array(data)

    return (data[:, 0:6], data[:, 6])


def normalize_data(X):
    x_means = np.mean(X, axis=0)
    x_std = np.std(X, axis=0)
    x_rng = np.ptp(X, axis=0)

    return (X - x_means) / x_std


def learn(X, Y):
    clf = LinearRegression(normalize=True)#random_state=None)
    clf.fit(X, Y)

    return clf


def predict_z(clf, X, Y, step_size):
    # create a mesh to plot in
    x_min, x_max = X[:, 0].min(), X[:, 0].max()
    y_min, y_max = X[:, 1].min(), X[:, 1].max()

    xx, yy = np.meshgrid(np.arange(x_min, x_max, step_size), np.arange(y_min, y_max, step_size))

    aa = np.multiply(xx, yy)
    bb = np.multiply(xx, xx)
    cc = np.multiply(yy, yy)
    dd = np.multiply(bb, cc)

    Z = clf.predict(np.c_[xx.ravel(), yy.ravel(), aa.ravel(), bb.ravel(), cc.ravel(), dd.ravel()])

    # Put the result into a color plot
    return (xx, yy, Z.reshape(xx.shape))


def plot(clf, title, X, Y):
    fig = plt.figure()
    ax = fig.gca()

    xx, yy, Z = predict_z(clf, X, Y, 1)

    # Plot the surface.
    im = ax.pcolormesh(xx, yy, Z, cmap=cm.coolwarm)
    fig.colorbar(im, ax=ax)
    ax.set(xlabel='Round #', ylabel='# Players ', title=title)
    #ax.grid()

    plt.show()


def plot3d(clf, title, X, Y):
    fig = plt.figure()
    ax = fig.gca(projection='3d')

    xx, yy, Z = predict_z(clf, X, Y, 1)

    # Plot the surface.
    surf = ax.plot_surface(xx, yy, Z, cmap=cm.coolwarm,
                                                  linewidth=0, antialiased=False)

    # Customize the z axis.
    ax.set_zlim(0.01, 1.01)
    ax.zaxis.set_major_locator(LinearLocator(10))
    ax.zaxis.set_major_formatter(FormatStrFormatter('%.02f'))

    # Add a color bar which maps values to colors.
    fig.colorbar(surf, shrink=0.5, aspect=5)

    ax.set(xlabel='Round #', ylabel='# Players ', title=title)

    plt.show()


def main():
    items = read_file()

    Y_LABELS = [
        'AVG_META_PCT_NONE',
        'AVG_META_PCT_FAIR',
        'AVG_META_PCT_PERFECT',
        'AVG_GOOD_SEAT_PCT'
    ]

    for y_label in Y_LABELS:
        X, Y = get_prediction_data(y_label, items)
        clf = learn(X, Y)
        print(y_label)
        print(clf.score(X, Y))
        plot(clf, y_label, X, Y)
        plot3d(clf, y_label, X, Y)


if __name__ == '__main__':
    main()
