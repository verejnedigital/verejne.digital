#!/bin/sh
if [ $# -lt 1 ]; then
    echo 'Please provide json file.'
    exit 1
fi

if [ ! -f $1 ]; then
    echo 'Please provide json file.'
    exit 1
fi

donedir=`dirname "$1"`"/done"
errdir=`dirname "$1"`"/err"
outdir=../pdfsender/input/
logname="${1%.*}".log

php makepdf.php "$1" "$outdir" > "$logname"

res=$?
if [ $res -eq 0 ]; then
	[ -d "$donedir" ] || mkdir "$donedir"
	mv "$1" "$logname" "$donedir"
else
	[ -d "$errdir" ] || mkdir "$errdir"
	mv "$1" "$logname" "$errdir"
fi
