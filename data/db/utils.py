"""Utility methods for package db."""

import yaml


def yaml_load(path):
    with open(path, 'r', encoding='utf-8') as f:
        # data_yaml = yaml.load(f, Loader=yaml.FullLoader)
        data_yaml = yaml.load(f, Loader=yaml.FullLoader)
    return data_yaml
