"""Utility methods for package db."""

import yaml


def yaml_load(path):
  with open(path, 'r') as f:
    data_yaml = yaml.load(f)
  return data_yaml
