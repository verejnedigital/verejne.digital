# Development
## Dependencies
### runtime
* php 7+

### libraries
* TCPDF (https://tcpdf.org)
* Smarty (smarty.net)

### Dev
* Composer (https://getcomposer.org/)

## Building
`composer install`

# Usage / Testing
## Directly
`php makepdf.php <input_json_file> <output_pdf_file>`

example:

`php makepdf.php sample_data/three_new.json ../pdfsender/input/three_new.pdf`

## Return codes
* `0` - PDF successfully created.
* `1` - Error during PDF creation.
* `2` - Temporary error during PDF creation. Try again later.

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
