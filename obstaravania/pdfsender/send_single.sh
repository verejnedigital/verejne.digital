#!/bin/sh
if [ $# -lt 1 ]; then
    echo 'Please provide json or pdf file.'
    exit 1
fi

if [ ! -f $1 ]; then
    echo 'Please provide json or pdf file.'
    exit 1
fi

jsonfile="${1%.*}".json
pdffile="${1%.*}".pdf
logname="${1%.*}".log
donedir=`dirname "$1"`"/done"
errdir=`dirname "$1"`"/err"

php sendpdf.php "$jsonfile" "$pdffile" > "$logname"

res=$?
if [ $res -eq 0 ]; then
	[ -d "$donedir" ] || mkdir "$donedir"
	mv "$jsonfile" "$pdffile" "$logname" "$donedir"
else
	[ -d "$errdir" ] || mkdir "$errdir"
	mv "$jsonfile" "$pdffile" "$logname" "$errdir"
fi

