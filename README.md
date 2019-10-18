# ts
A Unix Shell script that shows you the tree size

## Example Output
![ts - example output](https://raw.githubusercontent.com/jims-code/ts/master/ts.gif)

## Disclaimer
Use this script at your own risk. 

## System Requirements
* UNIX OS
* Standard tools (awk, bash, du, grep, sed,  ...)

## Installation
* Download the file "`ts`".
* Make it executable (e.g. "`chmod 755 ts`")
* Move the file "`ts`" to a directory of your choice (e.g. "`sudo mv ./ts /usr/local/bin/`"). The directory should be contained in the environment variable $PATH , so that you can start the script "`ts`" without entering the whole path.
* For security reasons I suggest changing the ownership to root ("`chown root.root /usr/local/bin/ts`"). This prevents (unwanted) changes in the script that maybe done by the script owner).

## Usage
```
commandprompt> ts [Options] [Directory]

[Options]
-h | --help    this help screen
-about         why ts?
-p <integer>   Only Pie Parts larger that <value> percent will be shown (default: $MIN_PIE_PART%)
-r <integer>   Radius of Pie Chart (default: screen size; if not detectable: $RADIUS_DEFAULT_SIZE)
-ru            display ruler
-s G|M|K|A     display size in Gigabyte/Megabyte/Kilobyte/Auto (default)
-v             print version information and exit
--             break command line parsing (needed if Directory begins with \"-\")

If no [Directory] is specified the current work Directory will be used.
```

## Feature Requests
* colored output

## Users, Testers and Submitters welcome
* Do you like to use the shell script? Users and Feedback are very welcome.
* The initial version 0.1 was tested on `kubuntu 5.10 (breezy) / i386` and `Solaris 8 / SPARC`. The current version was tested on `Ubuntu 18.04`. Testing is always a good idea - so if you would like to support you are welcome to run some tests.
* If you know some hints concerning shell scrpting and would like to support do not hesitate to do a code review, refactoring or create a new feature.
