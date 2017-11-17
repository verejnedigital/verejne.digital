# Development
## Dependencies
### libraries
* TCPDF (https://tcpdf.org)
* Smarty (smarty.net)

### Dev
* Composer (https://getcomposer.org/)

## Building
`composer install`

# Usage / Testing
## Directly
`php makepdf.php <input_json_file> <output_directory>`

example:

`php makepdf.php sample_data/three_new.json ../pdfsender/input/`

## As batch process
* create directory `[1]` where are input files
* execute `./makepdf_dir.sh [1]`
  * successfully created result will be put into `../sendpdf/input/`
  * successfully processed files with log files are moved to `[1]/done`
  * failed to processed files with log files are moved to `[1]/err`

# Directory structure
* `[vendor]` *- directory for libraries installed by composer*
* `[templates]` *- directory for smarty templates with resources*
  * `[cache]` *- cache for smarty*
  * `[compiled]` *- compiled smarty templates*
* `[resources]` *- images, icons and other resources used in result*
* `[sample_data]` *- sample json data*
* `composer.json` *- composer project file description*
* `makepdf.php` *- main app*
* `pdftemplate.php` *- template library for PDF output*
* `makepdf_single.sh` *- script to create PDF files using PHP app and then move result to right directories.*
* `makepdf_dir.sh` *- script to create all files from specified directory, for cron.*
