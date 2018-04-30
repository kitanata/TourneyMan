import csv
import statistics

from itertools import groupby


def averages_for_items(items, round_num, num_players):
    avg_meta_pct_none = statistics.mean([float(x['META_PCT_NONE']) for x in items])
    avg_meta_pct_fair = statistics.mean([float(x['META_PCT_FAIR']) for x in items])
    avg_meta_pct_perfect = statistics.mean([float(x['META_PCT_PERFECT']) for x in items])
    avg_score = statistics.mean([float(x['SCORE']) for x in items])
    avg_good_seat_pct = statistics.mean([float(x['GOOD_SEAT_PCT']) for x in items])

    return {
        'ROUND_NUM': round_num,
        'NUM_PLAYERS': num_players,
        'AVG_META_PCT_NONE': round(avg_meta_pct_none, 5),
        'AVG_META_PCT_FAIR': round(avg_meta_pct_fair, 5),
        'AVG_META_PCT_PERFECT': round(avg_meta_pct_perfect, 5),
        'AVG_SCORE': round(avg_score, 5),
        'AVG_GOOD_SEAT_PCT': round(avg_good_seat_pct, 5)
    }


def group_by_averages(items, keyfunc):
    averages = []
    items = sorted(items, key=keyfunc)
    for k, g in groupby(items, keyfunc):
        items = list(g)
        round_num = items[0]['ROUND_NUM']
        num_players = items[0]['NUM_PLAYERS']

        averages.append(averages_for_items(items, round_num, num_players))

    return averages


def write_csv(filename, items, fieldnames):
    with open(filename, 'w') as f:
        writer = csv.DictWriter(f, fieldnames)
        writer.writeheader()

        for row in items:
            writer.writerow(row)


results = []

with open('trial_results.csv', newline='') as csvfile:
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

        item['GOOD_SEAT_PCT'] = round(float(item['META_SCORE']) / float(item['NUM_PLAYERS']), 5)

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
    'SCORE', 'META_SCORE', 'GOOD_SEAT_PCT',
    'ROUND_NUM', 'NUM_PLAYERS',
    'NUM_TABLES', 'NUM_MAX_TABLES', 'NUM_MIN_TABLES',
    'MAX_SEATS_PER_TABLE', 'MIN_SEATS_PER_TABLE',
]

write_csv('analysis.csv', processed_items, fieldnames)

keyfunc = lambda x: (x['ROUND_NUM'], x['NUM_PLAYERS'])
round_player_averages = group_by_averages(processed_items, keyfunc)

keyfunc = lambda x: x['ROUND_NUM']
round_averages = group_by_averages(processed_items, keyfunc)

keyfunc = lambda x: x['NUM_PLAYERS']
player_averages = group_by_averages(processed_items, keyfunc)


summary_fieldnames = [
    'ROUND_NUM', 'NUM_PLAYERS', 
    'AVG_META_PCT_NONE', 'AVG_META_PCT_FAIR', 'AVG_META_PCT_PERFECT',
    'AVG_SCORE', 'AVG_GOOD_SEAT_PCT'
]

write_csv('round_player_averages.csv', round_player_averages, summary_fieldnames)
write_csv('round_averages.csv', round_averages, summary_fieldnames)
write_csv('player_averages.csv', player_averages, summary_fieldnames)

print("DONE!")

