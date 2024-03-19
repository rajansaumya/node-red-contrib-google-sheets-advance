# ![Google Sheets Logo](https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Google_Sheets_2020_Logo.svg/50px-Google_Sheets_2020_Logo.svg.png) node-red-contrib-google-sheets-advance

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Donate](https://img.shields.io/badge/buy%20me%20a%20coffee-donate-orange.svg)](https://www.buymeacoffee.com/your-username)

A versatile Node-RED node for interacting with Google Sheets, supporting features like reading, writing, appending, clearing, adding, and removing sheets.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Auth](#auth)
- [Sheets](#sheets)
- [Cells](#cells)
- [Credits](#credits)
- [Future Plans](#future-plans)
- [Feature Requests](#feature-requests)
- [Support](#support)
- [License](#license)

## Installation

Install via nodered pallete or run the following command in the root directory of your Node-RED install

```
npm install node-red-contrib-google-sheets-advance
```

## Usage

Configure the node with your Google service account credentials and the desired method (e.g., get, update, append, clear, add sheet).

For detailed instructions on setting up authentication, sheet IDs, and cell references, refer to the [Auth](#auth), [Sheets](#sheets), and [Cells](#cells) sections below.

## Auth

Follow these steps to set up authentication:

1. Create a new service account from [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts).
2. Download the JSON credentials file for the service account.
3. Give the service account access to the Google Sheets API.
4. Share your sheet with the email address of the service account (e.g., `sheet-builder@example-413410.iam.gserviceaccount.com`).

## Sheets

To find the sheet ID:

- Open your Google Sheet.
- Copy the ID from the URL (e.g., `https://docs.google.com/spreadsheets/d/your-sheet-id/edit`).

## Cells

Referencing cells in Google Sheets:

- The format is `Sheet1!A1:C3`, where `Sheet1` is the sheet name, `!` indicates the cell range, and `A1:C3` specifies the cells.
- A range of cells can be a row (e.g., `A1:A5`), a column (e.g., `A1:E1`), or a block (e.g., `A1:C3`).

## Additional Features

### Adding a Sheet

To add a new sheet to the workbook, simply pass the desired name for the sheet to be added to the workbook in `msg.cells`.

### Removing a Sheet

To remove a sheet from the workbook, `gid` if the desired sheet must be provided, example : `https://docs.google.com/spreadsheets/d/1VNwh8mkh5AruBkzdj46Tvjaes2d16OrtY8uNidY8Dhw/edit#gid=1342222962`

## Credits

This tool is built upon code references and inspiration from the [node-red-contrib-google-sheets](https://github.com/sammachin/node-red-contrib-google-sheets) repository. We acknowledge and appreciate the contributions of the original authors and maintainers of that repository.

## Future Plans

Our future plans for this tool include:

- Delete sheets using their names instead of gids.
- Enhancing user interface for better usability.
- Adding support for additional Google Sheets API functionalities.

## Feature Requests

If you have any feature requests or suggestions, please [open an issue](https://github.com/your-username/your-repo-name/issues) on GitHub. We welcome your feedback and ideas!

## Support

For support or questions, you can [contact us](mailto:your-email@example.com) directly.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
