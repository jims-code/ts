#!/bin/bash

# ts - a treesize shell script
# https://github.com/jims-code/ts
# GNU General Public License v3.0

# Parameters
INITIALVERSION="0.1 - 24.02.2006"
VERSION="0.2"
DATE="17.10.2019"
RADIUS="11"	# Auto
RADIUS_DEFAULT_SIZE="15"
UNIT="A"	# Auto
RULER="FALSE"
MIN_PIE_PART="10"	# 10% Minimum Size for Pie Chart

# The following 2 comments are just for the Development process...
# tty - returns name of tty
# stty -a displays settings

# Help Usage
usage () { # $1 = exit code
	echo "Usage: ts [Options] [Directory]"
	echo ""
	echo "[Options]"
	echo "-h | --help    this help screen"
	echo "-about         why ts?"
	echo "-p <integer>   Only Pie Parts larger that <value> percent will be shown (default: $MIN_PIE_PART%)"
	echo "-r <integer>   Radius of Pie Chart (default: screen size; if not detectable: $RADIUS_DEFAULT_SIZE)"
	echo "-ru            display ruler"
	echo "-s G|M|K|A     display size in Gigabyte/Megabyte/Kilobyte/Auto (default)"
	echo "-v             print version information and exit"
	echo "--             break command line parsing (needed if Directory begins with \"-\")"
	echo ""
	echo "If no [Directory] is specified the current work Directory will be used."
	exit $1
}

about () { 
	echo "Why is this script called \"ts\"?"
	echo ""
  echo "In the beginning this script was named \"munin\"."
	echo "Munin and Hugin are a pair of ravens being sent out by "
	echo "the Norse god Odin at dawn to gather information and "
	echo "return in the evening. Hugin is \"thought\" and Munin "
	echo "is \"memory\"."
	echo "So you can send out Munin to gather information on your "
	echo "disk usage..."
  echo ""
  echo "But since the name Munin is already in use for a networked"
  echo "resource monitoring tool a rebranding was necessary."
  echo "I chose a shorter name - like typical UNIX command names."
	echo ""
	echo "Why this script? What is the benefit?"
	echo ""
	echo "Think about the following situation:"
	echo "- you only have a text console, no X is available"
	echo "- your hard disk is nearly full"
	echo "- you would like to find out which directory uses so much space"
	echo "Then a tool like this is very useful."
	echo ""
	echo "Or maybe you just want to have fun using this tool...."
	exit 0
}

checkinteger () { # $1=Value that shall be tested
	if [ `echo "$1" | grep -c "^[0-9]*$"` -ne 1 ]; then
		echo "\"$1\" is not a valid value (must be integer)."
		exit 2
	fi 
}

# parsing command line arguments
while [ "$#" -gt 0 ]	# while still arguments exist
do
	case "$1" in
	"-h"|"--help")	usage ;;
	"-ts")	ts;;
	"-p")	checkinteger "$2"
		MIN_PIE_PART="$2"
		shift;;
	"-r")	checkinteger "$2"
		RADIUS="$2"	# set radius
		shift;;
	"-ru")	RULER="TRUE";;
	"-s")	if [[ "$2" != "G" && "$2" != "K" && "$2" != "M" && "$2" != "A" ]]; then
			echo "\"$2\" is not a valid unit (must be G, M, K or A)."
			exit 2
		fi
		UNIT=$2
		shift;;
	"-v"|"--version")	echo "treesize (ts) version $VERSION"
		echo "Jens Hoeft $DATE"
		exit 0;;
	"--")	shift
		break;;	# end of parameter list (if directory name begins with "-")
	-*)	echo "unknown command line parameter: '$1'"
		echo
		usage 2;;
	*)  break ;;	# end of parameter list
	esac
	shift	# $2 becomes $1
done

# check if a directory is specified
if [ -n "$1" ]; then         # -n is true if the argument is non-zero
	if [ ! -d "$1" ]; then
		echo "\"$1\" does not exist or is not a directory!"
		exit 1
	fi
	if [ "$1" == "/" ]; then
		DIR="/"
		FILES="/*"
	else
		DIR=`echo "$1" | sed s/"\(^..*\)\/"/"\1"/g`
		FILES="$DIR/*"
	fi
else
	DIR="."
	FILES="*"
fi

# detect screen size (stty rows and columns)
# to determine the maximum Radius
declare -i ROWS
declare -i COLUMNS
ROWS=$[`stty -a | nawk -F";" '{for (i=1;i<=NF;i++) print($i)}' | grep -i "rows" | sed s/" "//g | sed s/"^.*="//g` / 2]
COLUMNS=$[`stty -a | nawk -F";" '{for (i=1;i<=NF;i++) print($i)}' | grep -i "columns" | sed s/" "//g | sed s/"^.*="//g` / 4]
if [ "$RADIUS" == "A" ]; then
	if [ $ROWS -gt 0 ] && [ $COLUMNS -gt 0 ]; then
		if [ $ROWS -gt $COLUMNS ]; then
			RADIUS=$COLUMNS
		else
			RADIUS=$ROWS
		fi
	else
		RADIUS=$RADIUS_DEFAULT_SIZE
	fi
fi

# 100%
TOTAL=`du -sk "$DIR" | awk '{print($1)}'`

# main process....
du -sk $FILES | sort -nr | head -10 | sed s/"^\.\/"/""/g | \
nawk -v RADIUS=$RADIUS -v TOTAL=$TOTAL -v UNIT=$UNIT -v RULER=$RULER \
	-v MIN_PIE_PART=$MIN_PIE_PART '
# set coordinates
function setxy(x , y , chr) {
	if (chr == "")
		chr="*"
	x=x+RADIUS 
	y=y+RADIUS 
	x=x*2+1 # scaling for better visualization 
	zeile[y]=substr(zeile[y], 1, x-1) chr substr(zeile[y], x+1,2*DM-x)
}
BEGIN {
	DM=2*RADIUS+1
	PI=3.1416
	# determine size display unit
	if ( UNIT == "A" ) {
		if ( TOTAL < 100 )
			UNIT="K"
		else {
			if ( TOTAL/1024 < 100 )
				UNIT="M"
			else  UNIT="G"
			}
	}
	# create empty rows
	for (y=1; y<=DM;y++) {
		for (x=1; x<=2*DM;x++) {
		zeile[y]=zeile[y] " "}
	}
	# draw circle
	for (i=0; i <= 90; i++) {
		# Circle functions (sin/cos/...) use radian measure.
		# 1 degree corresponds 2*PI/360 in radian measure 
		# (approx. 0,01745).
		x=int(cos(i*PI/180)*RADIUS)
		y=int(sin(i*PI/180)*RADIUS)
		# print(i";"x";"y)	# for debugging purposes
		setxy( x ,  y)
		setxy(-x ,  y)
		setxy( x , -y)
		setxy(-x , -y)
	}
	# draw center
	setxy(0 , 0)
	# title
	print("")
	print("No.  File/Directory                                    " UNIT "B      %")
	print("================================================================")
	# draw angle 0
	for (r=0; r<=RADIUS; r++) {
		setxy(r , 0)
	}
}
{
	# draw angle
	# Input: $1=Size[KB], $2=Name
	PART=$1/TOTAL*100
	if ( PART < MIN_PIE_PART )
		next
	NUMBER=NUMBER+1
	ANGLE=PART*360/100
	ANGLE_TOT=ANGLE_TOT+ANGLE
	# size
	SIZE=$1
	SIZE_SUM=SIZE_SUM + SIZE
	if ( UNIT == "G" )
		SIZE=$1/1024/1024
	if ( UNIT == "M" )
		SIZE=$1/1024
	for (r=0; r<=RADIUS; r++) {
		x=int(cos(ANGLE_TOT*PI/180)*r)
		y=int(sin(ANGLE_TOT*PI/180)*r)
		setxy(x , y)
	}
	printf("%3d  %-38s    %10.3f  %5.2f\n", NUMBER, substr($2, 1, 30), SIZE, PART)
	# name of pie
	ANGLE_TEXT=ANGLE_TOT-ANGLE/2
	x=int(cos(ANGLE_TEXT*PI/180)*RADIUS*3/4)
	y=int(sin(ANGLE_TEXT*PI/180)*RADIUS*3/4)
	setxy(x , y, NUMBER)
}
END {
	# Other files/directories
	SIZE=TOTAL-SIZE_SUM
	PART=SIZE/TOTAL*100
	if ( UNIT == "G" )
		SIZE=SIZE/1024/1024
	if ( UNIT == "M" )
		SIZE=SIZE/1024
	NUMBER=NUMBER+1
	printf("%3d  %-38s    %10.3f  %5.2f\n", NUMBER, "Other", SIZE, PART)
	# name of pie
	ANGLE_TEXT=ANGLE_TOT+(360-ANGLE_TOT)/2
	x=int(cos(ANGLE_TEXT*PI/180)*RADIUS*3/4)
	y=int(sin(ANGLE_TEXT*PI/180)*RADIUS*3/4)
	setxy(x , y, NUMBER)
	# Screen Output
	# print pie chart
	for (y=1; y<=DM; y++) {
		if ( RULER == "TRUE" )
			printf ("%3i %-s %-3i\n",y,zeile[y],y)
		if ( RULER == "FALSE" )
			print (zeile[y])
	}
	# print ruler if necessary
	if ( RULER == "TRUE" ) {
		for (x=1; x<=DM; x++) {
			ruler=ruler substr(x , length(x), 1) " "
		}
		print("    " ruler)
	}
} '
