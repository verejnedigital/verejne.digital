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
`php makepdf.php <input_json_file> <output_pdf_file>`
example:
`php makepdf.php sample_data/three.json example.pdf`

# Directory structure
* [vendor] *- directory for libraries installed by composer*
* [templates] *- directory for smarty templates with resources*
 * [cache] *- cache for smarty*
 * [compiled] *- compiled smarty templates*
* [resources] *- images, icons and other resources used in result*
* [sample_data] *- sample json data*
* composer.json *- composer project file description*
* makepdf.php *- main app*
* pdftemplate.php *- template library for PDF output*