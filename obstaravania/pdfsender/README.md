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
`php sendpdf.php -u <username> -p <password> <input_json_file> <input_pdf_file>`

example:

`php sendpdf.php -u verejne -p digital input/four_new.json input/four_new.pdf`

see also `php sendpdf.php --help`

## Return codes
* `0` - PDF successfully created.
* `1` - Error during PDF creation.
* `2` - Temporary error during PDF creation. Try again later.

# Directory structure
* `[vendor]` *- directory for libraries installed by composer*
* `[libs]` *- directory with custom libraries*
  * `[zelenaposta]` *- libraries for integration with Zelena Pošta*
* `composer.json` *- composer project file description*
* `sendpdf.php` *- main app*
* `send_single.sh` *- script to send files using PHP app and then move result to right directories.*
* `send_dir.sh` *- script to send all files from specified directory, for cron.*
