import csv

with open('trial_results.csv', 'w') as results_file:
    writer = csv.writer(results_file)

    for trial_num in range(0, 10):
        with open('trial_run_' + str(trial_num) + '.csv') as trial_file:
            reader = csv.reader(trial_file)

            for row in reader:
                writer.writerow(row)
