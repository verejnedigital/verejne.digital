from os import walk, path
from glob import glob

README = '''
Recursively searching for *.js files inside 'src' folder and 
checking if the file is flowed ('// @flow' is on the first line)
'''
DELIM, PATH = '---------------------------------------------------------------', 'src'

print(README)
print(DELIM)

files = [y for x in walk(PATH) for y in glob(path.join(x[0], '*.js'))]
for filename in files:
    with open(filename) as file:
        first_line = file.readline().strip()
        if first_line != '// @flow':
            print('Unflowed file: \t"%s"' % filename)

print(DELIM)
