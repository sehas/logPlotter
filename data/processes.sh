#/bin/bash
RANGE=1500
COUNT=${1:-100}

MIN=200
for i in $(eval echo "{1..$COUNT}") ; do
	new_date=$(date +"%Y-%m-%dT%H:%M:%S%z" -d "+$i minutes");
	num=${RANDOM};
	let "num %= ${RANGE}-${MIN}"
	let "num += ${MIN}"
	echo $new_date,${num};
done

