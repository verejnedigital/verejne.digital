#!/usr/bin/env python
# -*- coding: utf-8 -*-
import state

def main():
    entities = state.Entities()
    entities.loadFromDatabase()
    entities.saveToDirectory('/data/www/verejne.digital/serving/prod')

if __name__ == '__main__':
  main()
