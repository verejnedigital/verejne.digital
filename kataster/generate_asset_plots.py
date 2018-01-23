#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import matplotlib
matplotlib.use('Agg')
import matplotlib.pylab as plt

from collections import defaultdict
from matplotlib.ticker import MaxNLocator

from utils import json_load, print_progress


DIR_DATA = '/home/matej_balog/data/'


""" Generates historical plots of unmovable asset counts from a JSON
    containing parsed asset declarations with property counts.
"""

def plot_declarations():
    # Load declarations with counts
    path_counts = DIR_DATA + 'NRSR_asset_declarations_with_counts.json'
    declarations = json_load(path_counts)
    years = [declaration['year'] for declaration in declarations]
    years = list(range(min(years), max(years)+1))

    # Group declarations by UserId
    user_declarations = defaultdict(list)
    for declaration in declarations:
        user_declarations[declaration['UserId']].append(declaration)

    # Matplotlib font
    matplotlib.rc('font', **{'size': 12, 'sans-serif' : 'Arial', 'family' : 'sans-serif'})

    # Iterate through all UserIds, and plot
    dir_save = DIR_DATA + 'asset_plots/'
    for ui, UserId in enumerate(user_declarations):
        # Skip declarations without necessary count data
        ds = user_declarations[UserId]
        years_declared = [d['year'] for d in ds]
        ds = [d for d in ds if ('num_houses' in d) and ('num_fields' in d) and ('num_others' in d)]
        if len(ds) == 0:
            continue

        # Extract quantities to plot
        xs = [d['year'] for d in ds]
        ys_houses = [d['num_houses'] for d in ds if 'num_houses' in d]
        ys_fields = [d['num_fields'] for d in ds if 'num_fields' in d]
        ys_others = [d['num_others'] for d in ds if 'num_others' in d]

        # Set up plot
        fig, ax = plt.subplots(1, 1, figsize=(4.6, 2.7))
        ax.set_frame_on(False)
        ax.tick_params(axis="both", which="both", bottom="off", top="off")
        ax.grid(b=True, axis='y', which='major', lw=0.2, color='black', alpha=0.3)

        # x-axis
        ax.set_xlim((years[0] - 1, years[-1] + 1))
        ax.set_xticks(years)
        ax.set_xticklabels(years, rotation=90)
        for xtick, year in zip(ax.get_xticklabels(), years):
            xtick.set_color('black' if year in years_declared else 'gray')

        # y-axis
        max_value = max([3.8, max(ys_houses), max(ys_fields), max(ys_others)])
        ax.set_ylim((-0.01, 1.04*max_value))
        ax.yaxis.set_major_locator(MaxNLocator(integer=True))

        # Plot
        plots = [
            (ys_houses, 'p', ( 31./255, 119./255, 180./255), 30, u'Stavby, byty'),
            (ys_fields, '^', ( 44./255, 160./255,  44./255), 20, u'Pôda, záhrady'),
            (ys_others, '*', (127./255, 127./255, 127./255), 10, u'Ostatné'),
        ]
        for ys, marker, color, zorder, label in plots:
            if max(ys) > 0:
                ax.plot(xs, ys, marker=marker, ms=12, markeredgewidth=0.0, linestyle='dotted',
                    color=color, zorder=zorder, clip_on=False, alpha=1, label=label)

        # Legend
        ax.legend(bbox_to_anchor=(1.0, -0.25), handletextpad=0.2, fontsize='small', ncol=3, frameon=False)
        
        # Save plot
        filename = ds[0]['surname'].title() + '_' + ds[0]['firstname'].title()
        fig.savefig(dir_save + filename + '.png', bbox_extra_artists=None, bbox_inches='tight', format='png', dpi=260)
        plt.close(fig)

        print_progress('Processed %d/%d UserIds' % (ui+1, len(user_declarations)))
    print('')


def main(args_dict):
    plot_declarations()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    args_dict = vars(parser.parse_args())
    try:
        main(args_dict)
    except:
        import pdb, sys, traceback
        type, value, tb = sys.exc_info()
        traceback.print_exc()
        pdb.post_mortem(tb)
        raise
