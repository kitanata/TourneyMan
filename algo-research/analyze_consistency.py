import csv

results = []

with open('trial_results_3_4_2.csv', newline='') as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        results.append(dict(row))


cons = {}
for item in results:
    key = (item['NUM_PLAYERS'], item['ROUND_NUM'])

    cur_cont = cons.get(key, [])
    cur_cont.append(item)
    cons[key] = cur_cont


processed_items = []

for k, items in cons.items():
    num_players, round_num = k

    total_perfect = 0.0
    total_fair = 0.0
    total_none = 0.0
    total_converged = 0.0
    smpl_size = len(items)

    for item in items:

        if item['CLASS'] == 'PERFECT':
            total_perfect += 1
        elif item['CLASS'] == 'FAIR':
            total_fair += 1
        elif item['CLASS'] == 'NONE':
            total_none += 1
        else:
            raise Exception('Unknown class for sample')

        if item['DID_CONVERGE'] == 'True':
            total_converged += 1

    pct_perfect = round(total_perfect / smpl_size, 5)
    pct_fair = round(total_fair / smpl_size, 5)
    pct_none = round(total_none / smpl_size, 5)
    pct_converged = total_converged / smpl_size

    for item in items:
        item['META_PCT_CONVERGED'] = pct_converged
        item['META_PCT_NONE'] = pct_none
        item['META_PCT_FAIR'] = pct_fair
        item['META_PCT_PERFECT'] = pct_perfect

        if pct_converged == 1.0:
            item['META_DID_CONVERGE'] = 'ALL_CONVERGED'
        elif pct_converged > 0.0:
            item['META_DID_CONVERGE'] = 'SOME_CONVERGED'
        else:
            item['META_DID_CONVERGE'] = 'NONE_CONVERGED'

        if pct_perfect == 1.0:
            item['META_CLASS'] = 'ALL_PERFECT'
        elif pct_fair == 1.0:
            item['META_CLASS'] = 'ALL_FAIR'
        elif pct_none == 1.0:
            item['META_CLASS'] = 'ALL_NONE'
        elif pct_perfect == 0.0:
            item['META_CLASS'] = 'SOME_FAIR_SOME_NONE'
        elif pct_fair == 0.0:
            item['META_CLASS'] = 'SOME_PERFECT_SOME_NONE'
        elif pct_none == 0.0:
            item['META_CLASS'] = 'SOME_PERFECT_SOME_FAIR'
        else:
            item['META_CLASS'] = 'SOME_PERFECT_SOME_FAIR_SOME_NONE'

        processed_items.append(item)

fieldnames = [
    'DID_CONVERGE', 'META_DID_CONVERGE', 'META_PCT_CONVERGED',
    'CLASS', 'META_CLASS',
    'META_PCT_NONE', 'META_PCT_FAIR', 'META_PCT_PERFECT',
    'SCORE', 'META_SCORE',
    'ROUND_NUM', 'NUM_PLAYERS',
    'NUM_TABLES', 'NUM_MAX_TABLES', 'NUM_MIN_TABLES',
    'MAX_SEATS_PER_TABLE', 'MIN_SEATS_PER_TABLE',
]

with open('analysis.csv', 'w') as f:
    writer = csv.DictWriter(f, fieldnames)
    writer.writeheader()

    for row in processed_items:
        writer.writerow(row)

print("DONE!")

