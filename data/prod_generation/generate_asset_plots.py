#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Generates plots of unmovable asset counts."""

import collections
import matplotlib
matplotlib.use('Agg')
import matplotlib.pylab as plt
import os
import sys

from matplotlib.ticker import MaxNLocator

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../db')))
from db import DatabaseConnection


DIR_SAVE = '/tmp/asset_plots/'


def plot_unmovable_asset_counts(declarations, years, dir_save):
  """Plots asset counts from `declarations` across `years`."""

  # Extract quantities to plot.
  years_declared, ys_houses, ys_fields, ys_others = zip(*[
      (d['year'], d['num_houses'], d['num_fields'], d['num_others'])
      for d in sorted(declarations, key=lambda d: d['year'])])

  # Set up plot.
  fig, ax = plt.subplots(1, 1, figsize=(4.6, 2.7))
  ax.set_frame_on(False)
  ax.tick_params(axis='both', which='both', bottom='off', top='off')
  ax.grid(b=True, axis='y', which='major', lw=0.2, color='black', alpha=0.3)

  # Set up x-axis.
  ax.set_xlim((years[0] - 1, years[-1] + 1))
  ax.set_xticks(years)
  ax.set_xticklabels(years, rotation=90)
  for xtick, year in zip(ax.get_xticklabels(), years):
    xtick.set_color('black' if year in years_declared else 'gray')

  # Set up y-axis.
  max_value = max([3.8, max(ys_houses), max(ys_fields), max(ys_others)])
  ax.set_ylim((-0.01, 1.04*max_value))
  ax.yaxis.set_major_locator(MaxNLocator(integer=True))

  # Plot the data.
  plots = [
      (ys_houses, 'p', ( 31./255, 119./255, 180./255), 30, u'Stavby, byty'),
      (ys_fields, '^', ( 44./255, 160./255,  44./255), 20, u'Pôda, záhrady'),
      (ys_others, '*', (127./255, 127./255, 127./255), 10, u'Ostatné'),
  ]
  for ys, marker, color, zorder, label in plots:
    if max(ys) > 0:
      ax.plot(years_declared, ys, marker=marker, ms=12,
              markeredgewidth=0.0, linestyle='dotted', color=color,
              zorder=zorder, clip_on=False, alpha=1, label=label)

  # Add legend.
  ax.legend(bbox_to_anchor=(1.0, -0.25), handletextpad=0.2,
            fontsize='small', ncol=3, frameon=False)

  # Save plot.
  path = os.path.join(dir_save, '%s_%s.png' % (
      declarations[0]['surname'].title(),
      declarations[0]['firstname'].title()
  ))
  fig.savefig(path, bbox_extra_artists=None, bbox_inches='tight',
              format='png', dpi=260)
  plt.close(fig)


def generate_unmovable_asset_count_plots():
  """Generates and saves asset count plots for all persons."""

  # Connect to most recent profil source schema in the database.
  db = DatabaseConnection(path_config='db_config.yaml')
  schema_profil = db.get_latest_schema('source_internal_profil_')
  db.execute('SET search_path="' + schema_profil + '";')

  # Load declarations data from the database.
  declarations = db.query("""
    SELECT
      PersonId,
      Persons.FirstName AS firstname,
      Persons.Surname AS surname,
      year,
      num_houses,
      num_fields,
      num_others
    FROM
      AssetDeclarations
    INNER JOIN
      Persons ON Persons.Id=AssetDeclarations.PersonId
    WHERE
      (num_houses IS NOT NULL) AND
      (num_fields IS NOT NULL) AND
      (num_others IS NOT NULL)
  ;""")

  # Compute range of years present in the declarations.
  years = [declaration['year'] for declaration in declarations]
  years = list(range(min(years), max(years)+1))

  # Group declarations by person.
  user_declarations = collections.defaultdict(list)
  for declaration in declarations:
    user_declarations[declaration['personid']].append(declaration)

  # Matplotlib font
  matplotlib.rc('font', **{
      'size': 11, 'sans-serif' : 'Arial', 'family' : 'sans-serif'})

  # Iterate through all persons, and plot.
  for ui, person_id in enumerate(user_declarations):
    # if person_id != 913:
    #   continue
    declarations = user_declarations[person_id]
    plot_unmovable_asset_counts(declarations, years, DIR_SAVE)
    if ui + 1 == len(user_declarations) or (ui + 1) % 50 == 0:
      print('Plotted %d/%d persons' % (
          ui + 1, len(user_declarations)))
  print('\nDeploy generated plots using\n'
        'sudo cp %s* '
        '/data/www/verejne.digital/resources/profil_asset_plots' % (
            DIR_SAVE))


def main():
  generate_unmovable_asset_count_plots()


if __name__ == '__main__':
  main()
