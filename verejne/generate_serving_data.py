#!/usr/bin/env python
# -*- coding: utf-8 -*-
import argparse
import state

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output_directory',
                        default='/data/www/verejne.digital/serving/prod/',
                        help='Directory to store data')
    args = parser.parse_args()

    entities = state.Entities()
    entities.loadFromDatabase()
    entities.saveToDirectory(args.output_directory)

if __name__ == '__main__':
  main()
