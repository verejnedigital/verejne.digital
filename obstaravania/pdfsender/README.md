# Development
## Dependencies
### libraries
* soap-client (https://github.com/phpro/soap-client)
* guzzlehttp/guzzle (http://docs.guzzlephp.org/en/stable/)
* http-factory-guzzle (https://github.com/http-interop/http-factory-guzzle)
* nategood/commando (https://github.com/nategood/commando)

### Dev
* zend-code (https://docs.zendframework.com/zend-code/)
  * *not needed for now*

## Building
`composer install`

# Usage / Testing
## Directly
`php sendpdf.php <input_json_file> <input_pdf_file>`

example:

`php sendpdf.php input/four_new.json input/four_new.pdf`

## As batch process
* create directory `[1]` where are input json and pdf files. PDF generated from json must have same name (and different extension)
  * example: `20171117-162810_36502464.json`, `20171117-162810_36502464.pdf` (date-time_ico)
* execute `./send_dir.sh [1]`
  * successfully send files with log files are moved to `[1]/done`
  * failed to send files with log files are moved to `[1]/err`

# Directory structure
* `[vendor]` *- directory for libraries installed by composer*
* `[libs]` *- directory with custom libraries*
  * `[zelenaposta]` *- libraries for integration with Zelena Pošta*
* `composer.json` *- composer project file description*
* `sendpdf.php` *- main app*
* `send_single.sh` *- script to send files using PHP app and then move result to right directories.*
* `send_dir.sh` *- script to send all files from specified directory, for cron.*
