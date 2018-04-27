import csv

import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
import matplotlib.pyplot as plt

from itertools import groupby

def read_file(filename):
    results = []

    with open('trial_results_3_4.csv', newline='') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            results.append(dict(row))

    return results


def transform_data_row(row):

    num_players = float(row['NUM_PLAYERS'])
    round_num = float(row['ROUND_NUM'])
    num_max_tables = float(row['NUM_MAX_TABLES'])
    num_min_tables = float(row['NUM_MIN_TABLES'])

    # round_num * num_max_tables > num_players looks promising

    return (
        float(1 if row['DID_CONVERGE'] == 'True' else 0),
        # 1.0 if num_players > round_num * num_max_tables else 0,
        num_players,
        round_num * num_max_tables
        # num_players ** 2,
        # round_num ** 2,
        # num_players * round_num,
        # float(row['NUM_MAX_TABLES']),
        # float(row['NUM_MIN_TABLES']),
        # float(row['MAX_SEATS_PER_TABLE']),
        # float(row['MIN_SEATS_PER_TABLE']),
    )


def extract_features(row):
    return (
        row[1],
        row[2],
        #row[3],
        #row[4],
        #row[5],
    )

def extract_class(row):
    return (row[0],)


def group_by_round_number(data):
    groups = {}
    data = sorted(data, key=lambda x: x[2])

    for k, g in groupby(data, key=lambda x: x[2]):
        groups[k] = list(g)

    return groups


def prepare_data(results):
    samples = np.array([transform_data_row(r) for r in results])

    X = samples[:, 1:]
    Y = np.array([samples[:, 0]]).T

    # x_means = np.mean(X, axis=0)
    # x_std = np.std(X, axis=0)
    # x_rng = np.ptp(X, axis=0)

    # X = (X - x_means) / x_std

    return X, Y


def learn_svc(X, Y):
    clf = SVC(random_state=0)
    clf.fit(X, Y)

    return clf


def plot(classifier, X, Y):
    # Note that using plt.subplots below is equivalent to using
    # fig = plt.figure() and then ax = fig.add_subplot(111)
    fig, ax = plt.subplots()

    t = range(0, len(X))

    num_features = 2

    # ax.scatter(t, X, alpha=0.5)
    S = np.append(X, Y, 1)
    s_true = np.array([x for x in S if x[num_features] == 1.0])
    s_false = np.array([x for x in S if x[num_features] != 1.0])

    ax.scatter(s_true[:, 0], s_true[:, 1], alpha=0.5, c='green', marker='o')
    ax.scatter(s_false[:, 0], s_false[:, 1], alpha=0.5, c='red', marker='+')

    h = 0.1  # step size in the mesh

    # create a mesh to plot in
    x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
    y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1

    xx, yy = np.meshgrid(np.arange(x_min, x_max, h), np.arange(y_min, y_max, h))

    # Plot the decision boundary. For that, we will assign a color to each
    # point in the mesh [x_min, m_max]x[y_min, y_max].
    Z = classifier.predict(np.c_[xx.ravel(), yy.ravel()])

    # Put the result into a color plot
    Z = Z.reshape(xx.shape)
    plt.contour(xx, yy, Z)

    ax.set(xlabel='# Players ', ylabel='Round #', title="Convergence")
    ax.grid()

    plt.show()


def main():
    results = read_file('trial_results.csv')

    X, Y = prepare_data(results)

    classifier = learn_svc(X, Y)
    plot(classifier, X, Y)

if __name__ == '__main__':
    main()
