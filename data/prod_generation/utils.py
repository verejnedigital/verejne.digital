"""Utility methods for production data generation."""

import six


def longest_common_prefix(str1, str2):
  """Returns the longest common prefix length of two strings."""
  limit = min(len(str1), len(str2))
  for i in six.moves.range(limit):
    if str1[i] != str2[i]:
      return i
  return limit
